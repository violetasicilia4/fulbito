import { createClient } from "@/lib/supabase/server";
import { ParticipantsAdmin } from "./ParticipantsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminParticipantsPage() {
  const supabase = await createClient();
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Participantes</h1>
        <p className="mt-1 text-sm text-ink/60">
          Creá un usuario y clave para cada amiga y compartiselos por WhatsApp junto con el
          link del prode. Ellas van a ingresar con esos datos en la pantalla de inicio.
        </p>
      </div>

      <ParticipantsAdmin initialParticipants={participants ?? []} />
    </div>
  );
}
