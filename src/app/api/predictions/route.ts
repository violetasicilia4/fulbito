import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const LOCKED_MESSAGE = "La predicción ya está cerrada porque el partido comenzó.";

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sesión no iniciada." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { match_id, predicted_home_score, predicted_away_score } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (
    typeof match_id !== "string" ||
    !isInteger(predicted_home_score) ||
    !isInteger(predicted_away_score)
  ) {
    return NextResponse.json(
      { error: "Los goles deben ser números enteros desde 0 en adelante." },
      { status: 400 },
    );
  }

  const { data: participant, error: participantError } = await supabase
    .from("participants")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (participantError || !participant) {
    return NextResponse.json({ error: "No encontramos tu perfil de participante." }, { status: 404 });
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, match_date")
    .eq("id", match_id)
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "El partido no existe." }, { status: 404 });
  }

  if (new Date(match.match_date).getTime() <= Date.now()) {
    return NextResponse.json({ error: LOCKED_MESSAGE }, { status: 409 });
  }

  const { data: saved, error: upsertError } = await supabase
    .from("predictions")
    .upsert(
      {
        user_id: participant.id,
        match_id,
        predicted_home_score,
        predicted_away_score,
      },
      { onConflict: "user_id,match_id" },
    )
    .select("*")
    .single();

  if (upsertError) {
    const message = upsertError.message?.includes("cerrada") ? LOCKED_MESSAGE : "No pudimos guardar tu predicción. Probá de nuevo.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ prediction: saved });
}
