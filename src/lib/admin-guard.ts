import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import type { Participant } from "@/lib/supabase/types";

/**
 * Ensures the current request comes from a logged-in participant flagged
 * as admin. Returns either the participant (so the route can keep going)
 * or a ready-to-return 401/403 response.
 */
export async function requireAdmin(): Promise<
  { participant: Participant } | { response: NextResponse }
> {
  const participant = await getCurrentParticipant();

  if (!participant) {
    return { response: NextResponse.json({ error: "Sesión no iniciada." }, { status: 401 }) };
  }

  if (!participant.is_admin) {
    return { response: NextResponse.json({ error: "No tenés permisos de administradora." }, { status: 403 }) };
  }

  return { participant };
}
