import type { Team } from "@/lib/supabase/types";

const FLAG_CDN_CODES: Record<string, string> = {
  MEX: "mx",
  RSA: "za",
  KOR: "kr",
  CZE: "cz",
  CAN: "ca",
  BIH: "ba",
  QAT: "qa",
  SUI: "ch",
  BRA: "br",
  MAR: "ma",
  HAI: "ht",
  SCO: "gb-sct",
  USA: "us",
  PAR: "py",
  AUS: "au",
  TUR: "tr",
  GER: "de",
  CUW: "cw",
  CIV: "ci",
  ECU: "ec",
  NED: "nl",
  JPN: "jp",
  SWE: "se",
  TUN: "tn",
  BEL: "be",
  EGY: "eg",
  IRN: "ir",
  NZL: "nz",
  ESP: "es",
  CPV: "cv",
  KSA: "sa",
  URU: "uy",
  FRA: "fr",
  SEN: "sn",
  IRQ: "iq",
  NOR: "no",
  ARG: "ar",
  ALG: "dz",
  AUT: "at",
  JOR: "jo",
  POR: "pt",
  COD: "cd",
  UZB: "uz",
  COL: "co",
  ENG: "gb-eng",
  CRO: "hr",
  GHA: "gh",
  PAN: "pa",
};

function flagImageUrl(team: Team | null): string | null {
  if (!team) return null;
  if (team.flag_url) return team.flag_url;
  const code = team.country_code ? FLAG_CDN_CODES[team.country_code.toUpperCase()] : null;
  return code ? `https://flagcdn.com/w160/${code}.png` : null;
}

export function TeamBadge({
  team,
  align = "start",
}: {
  team: Team | null;
  align?: "start" | "end";
}) {
  const name = team?.name ?? "A definir";

  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${align === "end" ? "items-end text-right" : "items-start text-left"}`}>
      <FlagBubble team={team} />
      <span className="text-xs font-semibold leading-tight text-ink sm:text-sm">{name}</span>
    </div>
  );
}

function FlagBubble({ team }: { team: Team | null }) {
  const url = flagImageUrl(team);

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`Bandera de ${team?.name}`}
        className="h-10 w-10 shrink-0 rounded-full border border-line object-cover shadow-sm"
      />
    );
  }

  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-[10px] font-black uppercase tracking-tight text-ink/40"
      aria-hidden
    >
      {team?.country_code?.slice(0, 3) ?? "?"}
    </span>
  );
}
