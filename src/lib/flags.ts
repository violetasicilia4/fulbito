import type { Team } from "@/lib/supabase/types";

/**
 * Single source of truth for country flags. Falls back from the team's own
 * `flag_url` to a derived flagcdn.com URL keyed by FIFA country code, so the
 * UI always renders a real flag image instead of emoji or placeholders.
 */
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

export function flagImageUrl(team: Pick<Team, "flag_url" | "country_code"> | null | undefined): string | null {
  if (!team) return null;
  if (team.flag_url) return team.flag_url;
  const code = team.country_code ? FLAG_CDN_CODES[team.country_code.toUpperCase()] : null;
  return code ? `https://flagcdn.com/w160/${code}.png` : null;
}
