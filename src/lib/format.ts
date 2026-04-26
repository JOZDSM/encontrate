export function formatDateUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatDateLongES(d: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(d);
}
