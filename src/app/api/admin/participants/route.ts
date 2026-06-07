import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createParticipantAccount } from "@/lib/create-participant";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { email, display_name, password, is_admin } = (body ?? {}) as Record<string, unknown>;

  if (typeof email !== "string" || typeof display_name !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Faltan datos: email, nombre visible y clave." }, { status: 400 });
  }

  const result = await createParticipantAccount({
    email,
    displayName: display_name,
    password,
    isAdmin: Boolean(is_admin),
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ participant: result.participant });
}
