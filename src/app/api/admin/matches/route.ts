import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { phase, group_name, home_team_id, away_team_id, match_date, external_api_id } =
    (body ?? {}) as Record<string, unknown>;

  if (
    typeof phase !== "string" ||
    typeof home_team_id !== "string" ||
    typeof away_team_id !== "string" ||
    typeof match_date !== "string" ||
    !match_date
  ) {
    return NextResponse.json({ error: "Completá fase, equipos y fecha del partido." }, { status: 400 });
  }

  if (home_team_id === away_team_id) {
    return NextResponse.json({ error: "El equipo local y el visitante no pueden ser el mismo." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: match, error } = await admin
    .from("matches")
    .insert({
      phase,
      group_name: typeof group_name === "string" && group_name ? group_name : null,
      home_team_id,
      away_team_id,
      match_date: new Date(match_date).toISOString(),
      external_api_id: typeof external_api_id === "string" && external_api_id ? external_api_id : null,
    })
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .single();

  if (error || !match) {
    return NextResponse.json({ error: "No pudimos crear el partido." }, { status: 500 });
  }

  return NextResponse.json({ match });
}
