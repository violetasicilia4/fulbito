const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
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
