const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: ARGENTINA_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: ARGENTINA_TIME_ZONE,
});

export function formatMatchDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatMatchTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

export function hasKickedOff(matchDateIso: string, now: Date = new Date()): boolean {
  return new Date(matchDateIso).getTime() <= now.getTime();
}
