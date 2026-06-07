import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { phase, group_name, home_team_id, away_team_id, match_date, status, external_api_id } =
    (body ?? {}) as Record<string, unknown>;

  const updates: Partial<{
    phase: string;
    group_name: string | null;
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    status: string;
    external_api_id: string | null;
  }> = {};
  if (typeof phase === "string" && phase) updates.phase = phase;
  if (typeof group_name === "string") updates.group_name = group_name || null;
  if (typeof home_team_id === "string" && home_team_id) updates.home_team_id = home_team_id;
  if (typeof away_team_id === "string" && away_team_id) updates.away_team_id = away_team_id;
  if (typeof match_date === "string" && match_date) updates.match_date = new Date(match_date).toISOString();
  if (typeof status === "string" && ["scheduled", "live", "finished"].includes(status)) updates.status = status;
  if (typeof external_api_id === "string") updates.external_api_id = external_api_id || null;

  if (updates.home_team_id && updates.away_team_id && updates.home_team_id === updates.away_team_id) {
    return NextResponse.json({ error: "El equipo local y el visitante no pueden ser el mismo." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: match, error } = await admin
    .from("matches")
    .update(updates)
    .eq("id", id)
    .select("*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)")
    .single();

  if (error || !match) {
    return NextResponse.json({ error: "No pudimos actualizar el partido." }, { status: 500 });
  }

  return NextResponse.json({ match });
}
