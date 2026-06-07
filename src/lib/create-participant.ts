import { createAdminClient } from "@/lib/supabase/admin";
import type { Participant } from "@/lib/supabase/types";

export type CreateParticipantResult =
  | { participant: Participant }
  | { error: string; status: number };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Creates both the Supabase Auth user (with the participant's real email) and
 * the matching `participants` profile row, optionally uploading a profile
 * photo to the `avatars` storage bucket. Used by the public self-signup flow
 * and by the admin "create participant" tool — the only difference between
 * them is who's allowed to set `isAdmin` and whether a photo is required.
 */
export async function createParticipantAccount({
  email,
  displayName,
  password,
  avatarFile,
  requireAvatar = false,
  isAdmin = false,
}: {
  email: string;
  displayName: string;
  password: string;
  avatarFile?: File | null;
  requireAvatar?: boolean;
  isAdmin?: boolean;
}): Promise<CreateParticipantResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanDisplayName = displayName.trim();

  if (!EMAIL_RE.test(cleanEmail)) {
    return { error: "Ingresá un email válido.", status: 400 };
  }
  if (cleanDisplayName.length < 2) {
    return { error: "Ingresá un nombre visible un poco más largo.", status: 400 };
  }
  if (password.length < 6) {
    return { error: "La clave debe tener al menos 6 caracteres.", status: 400 };
  }
  if (requireAvatar && !avatarFile) {
    return { error: "Subí una foto de perfil para crear tu cuenta.", status: 400 };
  }
  if (avatarFile && !ALLOWED_AVATAR_TYPES[avatarFile.type]) {
    return { error: "La foto de perfil debe ser JPG, PNG o WEBP.", status: 400 };
  }
  if (avatarFile && avatarFile.size > MAX_AVATAR_BYTES) {
    return { error: "La foto de perfil no puede pesar más de 5 MB.", status: 400 };
  }

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { display_name: cleanDisplayName },
  });

  if (createError || !created.user) {
    console.error("createParticipantAccount: auth.admin.createUser failed", createError);
    const taken = createError?.message?.toLowerCase().includes("already");
    return {
      error: taken ? "Ya existe una cuenta con ese email. Probá ingresar en vez de crear una nueva." : "No pudimos crear la cuenta. Probá de nuevo.",
      status: 409,
    };
  }

  let avatarUrl: string | null = null;
  if (avatarFile) {
    const extension = ALLOWED_AVATAR_TYPES[avatarFile.type];
    const path = `${created.user.id}/avatar.${extension}`;
    const { error: uploadError } = await admin.storage
      .from("avatars")
      .upload(path, avatarFile, { contentType: avatarFile.type, upsert: true });

    if (uploadError) {
      await admin.auth.admin.deleteUser(created.user.id);
      return { error: "No pudimos subir la foto de perfil. Probá de nuevo.", status: 500 };
    }

    avatarUrl = admin.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  }

  const { data: participant, error: insertError } = await admin
    .from("participants")
    .insert({
      auth_user_id: created.user.id,
      email: cleanEmail,
      display_name: cleanDisplayName,
      avatar_url: avatarUrl,
      is_admin: isAdmin,
    })
    .select("*")
    .single();

  if (insertError || !participant) {
    console.error("createParticipantAccount: participants insert failed", insertError);
    // Roll back the auth user so we don't leave an orphaned account behind.
    await admin.auth.admin.deleteUser(created.user.id);
    const taken = insertError?.message?.includes("duplicate");
    return {
      error: taken ? "Ya existe una cuenta con ese email. Probá ingresar en vez de crear una nueva." : "No pudimos guardar tu perfil. Probá de nuevo.",
      status: 409,
    };
  }

  return { participant };
}
