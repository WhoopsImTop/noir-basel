const BCP47_BY_LOCALE: Record<string, string> = {
  de: "de-CH",
  en: "en-CH",
  fr: "fr-CH",
  it: "it-CH",
};

export function toBcp47Locale(code: string): string {
  return BCP47_BY_LOCALE[code] ?? "de-CH";
}
