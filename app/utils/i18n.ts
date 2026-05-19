/** Wandelt von `tm()` gelieferte Message-ASTs in lesbare Strings um. */
export function resolveI18nMessage(value: unknown, rt: (message: unknown) => string): string {
  if (typeof value === "string") {
    return value;
  }
  if (value == null) {
    return "";
  }
  return rt(value);
}

export function resolveI18nList(values: unknown, rt: (message: unknown) => string): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((item) => resolveI18nMessage(item, rt));
}

export function resolveI18nSections(
  values: unknown,
  rt: (message: unknown) => string,
): Array<{ title: string; body: string }> {
  if (!Array.isArray(values)) {
    return [];
  }
  return values.map((section) => {
    const entry = section as { title?: unknown; body?: unknown };
    return {
      title: resolveI18nMessage(entry.title, rt),
      body: resolveI18nMessage(entry.body, rt),
    };
  });
}
