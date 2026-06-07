/**
 * Sample seed data for the 2026 World Cup group stage.
 *
 * The official draw/fixture should be loaded by the admin (via /admin or by
 * editing supabase/seed.sql) once it is confirmed — this dataset only exists
 * so the MVP has something realistic to show out of the box. Flags are
 * rendered with emoji so no external assets/CDN are required.
 */

export interface SeedTeam {
  name: string;
  country_code: string;
  flag_emoji: string;
  group_name: string;
}

export const SEED_TEAMS: SeedTeam[] = [
  // Grupo A
  { name: "México", country_code: "MEX", flag_emoji: "🇲🇽", group_name: "A" },
  { name: "Canadá", country_code: "CAN", flag_emoji: "🇨🇦", group_name: "A" },
  { name: "Polonia", country_code: "POL", flag_emoji: "🇵🇱", group_name: "A" },
  { name: "Argelia", country_code: "ALG", flag_emoji: "🇩🇿", group_name: "A" },
  // Grupo B
  { name: "Estados Unidos", country_code: "USA", flag_emoji: "🇺🇸", group_name: "B" },
  { name: "Gales", country_code: "WAL", flag_emoji: "🏴", group_name: "B" },
  { name: "Costa de Marfil", country_code: "CIV", flag_emoji: "🇨🇮", group_name: "B" },
  { name: "Australia", country_code: "AUS", flag_emoji: "🇦🇺", group_name: "B" },
  // Grupo C
  { name: "Argentina", country_code: "ARG", flag_emoji: "🇦🇷", group_name: "C" },
  { name: "Uruguay", country_code: "URU", flag_emoji: "🇺🇾", group_name: "C" },
  { name: "Nigeria", country_code: "NGA", flag_emoji: "🇳🇬", group_name: "C" },
  { name: "Catar", country_code: "QAT", flag_emoji: "🇶🇦", group_name: "C" },
  // Grupo D
  { name: "Francia", country_code: "FRA", flag_emoji: "🇫🇷", group_name: "D" },
  { name: "Países Bajos", country_code: "NED", flag_emoji: "🇳🇱", group_name: "D" },
  { name: "Senegal", country_code: "SEN", flag_emoji: "🇸🇳", group_name: "D" },
  { name: "Panamá", country_code: "PAN", flag_emoji: "🇵🇦", group_name: "D" },
  // Grupo E
  { name: "España", country_code: "ESP", flag_emoji: "🇪🇸", group_name: "E" },
  { name: "Croacia", country_code: "CRO", flag_emoji: "🇭🇷", group_name: "E" },
  { name: "Ecuador", country_code: "ECU", flag_emoji: "🇪🇨", group_name: "E" },
  { name: "Ghana", country_code: "GHA", flag_emoji: "🇬🇭", group_name: "E" },
  // Grupo F
  { name: "Brasil", country_code: "BRA", flag_emoji: "🇧🇷", group_name: "F" },
  { name: "Suiza", country_code: "SUI", flag_emoji: "🇨🇭", group_name: "F" },
  { name: "Japón", country_code: "JPN", flag_emoji: "🇯🇵", group_name: "F" },
  { name: "Egipto", country_code: "EGY", flag_emoji: "🇪🇬", group_name: "F" },
  // Grupo G
  { name: "Portugal", country_code: "POR", flag_emoji: "🇵🇹", group_name: "G" },
  { name: "Bélgica", country_code: "BEL", flag_emoji: "🇧🇪", group_name: "G" },
  { name: "Irán", country_code: "IRN", flag_emoji: "🇮🇷", group_name: "G" },
  { name: "Sudáfrica", country_code: "RSA", flag_emoji: "🇿🇦", group_name: "G" },
  // Grupo H
  { name: "Inglaterra", country_code: "ENG", flag_emoji: "🏴", group_name: "H" },
  { name: "Alemania", country_code: "GER", flag_emoji: "🇩🇪", group_name: "H" },
  { name: "Colombia", country_code: "COL", flag_emoji: "🇨🇴", group_name: "H" },
  { name: "Corea del Sur", country_code: "KOR", flag_emoji: "🇰🇷", group_name: "H" },
];

export interface SeedMatch {
  group_name: string;
  home: string;
  away: string;
  /** ISO date-time string, local Mexico/US/Canada kickoff converted to UTC */
  match_date: string;
}

// Two opening matchdays per group, generated round-robin style starting June 11, 2026.
function buildSeedMatches(): SeedMatch[] {
  const matches: SeedMatch[] = [];
  const groups = Array.from(new Set(SEED_TEAMS.map((t) => t.group_name)));
  let dayOffset = 0;

  for (const group of groups) {
    const teams = SEED_TEAMS.filter((t) => t.group_name === group);
    const [a, b, c, d] = teams;
    const baseDay = 11 + dayOffset; // tournament kicks off June 11, 2026
    matches.push(
      {
        group_name: group,
        home: a.name,
        away: b.name,
        match_date: `2026-06-${String(baseDay).padStart(2, "0")}T18:00:00-06:00`,
      },
      {
        group_name: group,
        home: c.name,
        away: d.name,
        match_date: `2026-06-${String(baseDay).padStart(2, "0")}T21:00:00-06:00`,
      },
      {
        group_name: group,
        home: a.name,
        away: c.name,
        match_date: `2026-06-${String(baseDay + 4).padStart(2, "0")}T18:00:00-06:00`,
      },
      {
        group_name: group,
        home: b.name,
        away: d.name,
        match_date: `2026-06-${String(baseDay + 4).padStart(2, "0")}T21:00:00-06:00`,
      },
    );
    dayOffset += 1;
  }

  return matches;
}

export const SEED_MATCHES: SeedMatch[] = buildSeedMatches();
