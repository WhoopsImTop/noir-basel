/** Extrahiert YYYY-MM-DD aus API-/Query-Werten (auch ISO-UTC und „2026-05-29 00:00:00“). */
export function normalizeBookingDateInput(value: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-CA", { timeZone: "Europe/Zurich" });
    }
  }

  const datePart = trimmed.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  return trimmed;
}

/** Extrahiert HH:mm aus API-/Query-Werten (auch „2026-05-28 09:30:00“). */
export function normalizeBookingTimeInput(value: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return "";
  const match = trimmed.match(/(\d{1,2}):(\d{2})/);
  if (!match) return trimmed;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export function formatBookingDate(value: string, locale: string): string {
  const normalized = normalizeBookingDateInput(value);
  if (!normalized) return "—";
  const parsed = new Date(`${normalized}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

export function formatBookingTime(value: string, locale: string): string {
  const normalized = normalizeBookingTimeInput(value);
  if (!normalized) return "—";
  const [hours, minutes] = normalized.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const parsed = new Date(2000, 0, 1, hours, minutes);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(parsed);
}
