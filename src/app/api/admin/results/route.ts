import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculatePoints } from "@/lib/scoring";

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * Manual results entry for the MVP. Saves the official score, marks the
 * match as finished and recalculates every participant's points for that
 * match using the single shared `calculatePoints` function — the same one
 * an automated results-sync job would call later.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { match_id, home_score, away_score } = (body ?? {}) as Record<string, unknown>;

  if (typeof match_id !== "string" || !isInteger(home_score) || !isInteger(away_score)) {
    return NextResponse.json(
      { error: "Completá un resultado válido (números enteros desde 0)." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: match, error: matchError } = await admin
    .from("matches")
    .update({ home_score, away_score, status: "finished" })
    .eq("id", match_id)
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .single();

  if (matchError || !match) {
    return NextResponse.json({ error: "No pudimos guardar el resultado." }, { status: 500 });
  }

  const { data: predictions, error: predictionsError } = await admin
    .from("predictions")
    .select("id, predicted_home_score, predicted_away_score")
    .eq("match_id", match_id);

  if (predictionsError) {
    return NextResponse.json({ error: "Resultado guardado, pero no pudimos recalcular los puntos." }, { status: 500 });
  }

  await Promise.all(
    (predictions ?? []).map((prediction) =>
      admin
        .from("predictions")
        .update({
          points: calculatePoints(
            home_score,
            away_score,
            prediction.predicted_home_score,
            prediction.predicted_away_score,
          ),
        })
        .eq("id", prediction.id),
    ),
  );

  return NextResponse.json({ match, recalculated: predictions?.length ?? 0 });
}
