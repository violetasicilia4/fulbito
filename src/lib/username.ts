/**
 * Participants log in with a simple username + password instead of an email.
 * Supabase Auth requires an email, so each username maps to a private,
 * never-shown synthetic address inside a fixed domain. Pure helpers only —
 * safe to import from both client and server code.
 */
const AUTH_DOMAIN = "fulbito.prode.local";

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase().replace(/\s+/g, "");
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${AUTH_DOMAIN}`;
}
