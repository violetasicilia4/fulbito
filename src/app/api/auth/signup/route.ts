import { NextResponse } from "next/server";
import { createParticipantAccount } from "@/lib/create-participant";

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const email = form.get("email");
  const displayName = form.get("display_name");
  const password = form.get("password");
  const avatar = form.get("avatar");

  if (typeof email !== "string" || typeof displayName !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Faltan datos: email, nombre visible y clave." }, { status: 400 });
  }

  const result = await createParticipantAccount({
    email,
    displayName,
    password,
    avatarFile: avatar instanceof File ? avatar : null,
    requireAvatar: true,
    isAdmin: false,
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ participant: result.participant });
}
