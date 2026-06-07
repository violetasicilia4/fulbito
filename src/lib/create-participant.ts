import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeUsername, usernameToEmail } from "@/lib/username";
import type { Participant } from "@/lib/supabase/types";

export type CreateParticipantResult =
  | { participant: Participant }
  | { error: string; status: number };

/**
 * Creates both the Supabase Auth user (with the synthetic email mapped from
 * the username) and the matching `participants` profile row. Used by the
 * public self-signup flow and by the admin "create participant" tool — the
 * only difference between them is who's allowed to set `isAdmin`.
 */
export async function createParticipantAccount({
  username,
  displayName,
  password,
  isAdmin = false,
}: {
  username: string;
  displayName: string;
  password: string;
  isAdmin?: boolean;
}): Promise<CreateParticipantResult> {
  const cleanUsername = normalizeUsername(username);
  const cleanDisplayName = displayName.trim();

  if (cleanUsername.length < 3) {
    return { error: "El usuario debe tener al menos 3 caracteres.", status: 400 };
  }
  if (!/^[a-z0-9_.]+$/.test(cleanUsername)) {
    return { error: "El usuario solo puede tener letras, números, puntos y guiones bajos.", status: 400 };
  }
  if (cleanDisplayName.length < 2) {
    return { error: "Ingresá un nombre visible un poco más largo.", status: 400 };
  }
  if (password.length < 6) {
    return { error: "La clave debe tener al menos 6 caracteres.", status: 400 };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: usernameToEmail(cleanUsername),
    password,
    email_confirm: true,
    user_metadata: { display_name: cleanDisplayName, username: cleanUsername },
  });

  if (createError || !created.user) {
    const taken = createError?.message?.toLowerCase().includes("already");
    return {
      error: taken ? "Ese nombre de usuario ya está en uso. Probá con otro." : "No pudimos crear la cuenta. Probá de nuevo.",
      status: 409,
    };
  }

  const { data: participant, error: insertError } = await admin
    .from("participants")
    .insert({
      auth_user_id: created.user.id,
      username: cleanUsername,
      display_name: cleanDisplayName,
      is_admin: isAdmin,
    })
    .select("*")
    .single();

  if (insertError || !participant) {
    // Roll back the auth user so we don't leave an orphaned account behind.
    await admin.auth.admin.deleteUser(created.user.id);
    const taken = insertError?.message?.includes("duplicate");
    return {
      error: taken ? "Ese nombre de usuario ya está en uso. Probá con otro." : "No pudimos guardar tu perfil. Probá de nuevo.",
      status: 409,
    };
  }

  return { participant };
}
