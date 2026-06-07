import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeUsername, usernameToEmail } from "@/lib/username";

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const { username, display_name, password, is_admin } = (body ?? {}) as Record<string, unknown>;

  if (typeof username !== "string" || typeof display_name !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Faltan datos: usuario, nombre visible y clave." }, { status: 400 });
  }

  const cleanUsername = normalizeUsername(username);
  const cleanDisplayName = display_name.trim();

  if (cleanUsername.length < 3) {
    return NextResponse.json({ error: "El usuario debe tener al menos 3 caracteres." }, { status: 400 });
  }
  if (cleanDisplayName.length < 2) {
    return NextResponse.json({ error: "El nombre visible es muy corto." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "La clave debe tener al menos 6 caracteres." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: usernameToEmail(cleanUsername),
    password,
    email_confirm: true,
    user_metadata: { display_name: cleanDisplayName, username: cleanUsername },
  });

  if (createError || !created.user) {
    const message = createError?.message?.toLowerCase().includes("already")
      ? "Ese nombre de usuario ya está en uso."
      : "No pudimos crear la cuenta. Probá con otro usuario.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  const { data: participant, error: insertError } = await admin
    .from("participants")
    .insert({
      auth_user_id: created.user.id,
      username: cleanUsername,
      display_name: cleanDisplayName,
      is_admin: Boolean(is_admin),
    })
    .select("*")
    .single();

  if (insertError || !participant) {
    // Roll back the auth user so we don't leave an orphaned account behind.
    await admin.auth.admin.deleteUser(created.user.id);
    const message = insertError?.message?.includes("duplicate")
      ? "Ese nombre de usuario ya está en uso."
      : "No pudimos guardar el perfil de la participante.";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  return NextResponse.json({ participant });
}
