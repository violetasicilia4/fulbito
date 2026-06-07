import { NextResponse } from "next/server";
import { createParticipantAccount } from "@/lib/create-participant";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { username, display_name, password } = (body ?? {}) as Record<string, unknown>;

  if (typeof username !== "string" || typeof display_name !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Faltan datos: usuario, nombre visible y clave." }, { status: 400 });
  }

  const result = await createParticipantAccount({
    username,
    displayName: display_name,
    password,
    isAdmin: false,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ participant: result.participant });
}
