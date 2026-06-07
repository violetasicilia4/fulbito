import { createClient } from "@/lib/supabase/server";
import type { Participant } from "@/lib/supabase/types";

/** Returns the logged-in participant's profile row, or null if not authenticated. */
export async function getCurrentParticipant(): Promise<Participant | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("participants")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data ?? null;
}
