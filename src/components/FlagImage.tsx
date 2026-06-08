import { flagImageUrl } from "@/lib/flags";
import type { Team } from "@/lib/supabase/types";

const SIZES = {
  sm: "h-6 w-6 text-[8px]",
  md: "h-10 w-10 text-[10px]",
};

export function FlagImage({
  team,
  size = "md",
}: {
  team: Pick<Team, "name" | "flag_url" | "country_code"> | null | undefined;
  size?: keyof typeof SIZES;
}) {
  const url = flagImageUrl(team);
  const sizeClass = SIZES[size];

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`Bandera de ${team?.name ?? "equipo"}`}
        className={`${sizeClass} shrink-0 rounded-full border border-line object-cover shadow-sm`}
      />
    );
  }

  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full border border-line bg-cream font-black uppercase tracking-tight text-ink/40`}
      aria-hidden
    >
      {team?.country_code?.slice(0, 3) ?? "?"}
    </span>
  );
}
