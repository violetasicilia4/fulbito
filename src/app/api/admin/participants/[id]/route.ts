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

  const { display_name, is_admin, new_password } = (body ?? {}) as Record<string, unknown>;

  const admin = createAdminClient();

  const updates: Partial<{ display_name: string; is_admin: boolean }> = {};
  if (typeof display_name === "string" && display_name.trim().length >= 2) {
    updates.display_name = display_name.trim();
  }
  if (typeof is_admin === "boolean") {
    updates.is_admin = is_admin;
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await admin.from("participants").update(updates).eq("id", id);
    if (error) {
      return NextResponse.json({ error: "No pudimos actualizar el perfil." }, { status: 500 });
    }
  }

  if (typeof new_password === "string" && new_password.length > 0) {
    if (new_password.length < 6) {
      return NextResponse.json({ error: "La nueva clave debe tener al menos 6 caracteres." }, { status: 400 });
    }

    const { data: participant } = await admin.from("participants").select("auth_user_id").eq("id", id).maybeSingle();
    if (!participant?.auth_user_id) {
      return NextResponse.json({ error: "No encontramos la cuenta asociada." }, { status: 404 });
    }

    const { error: pwError } = await admin.auth.admin.updateUserById(participant.auth_user_id, {
      password: new_password,
    });
    if (pwError) {
      return NextResponse.json({ error: "No pudimos cambiar la clave." }, { status: 500 });
    }
  }

  const { data: updated } = await admin.from("participants").select("*").eq("id", id).maybeSingle();

  return NextResponse.json({ participant: updated });
}
