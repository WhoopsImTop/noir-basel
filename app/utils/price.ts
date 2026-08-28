import { toBcp47Locale } from "./locale";

export function getCompareAtPrice(item: {
  old_price?: number | null;
  oldPrice?: number | null;
}): number | null {
  const value = item.old_price ?? item.oldPrice ?? null;
  return typeof value === "number" ? value : null;
}

export function hasSalePrice(item: {
  price: number;
  old_price?: number | null;
  oldPrice?: number | null;
}): boolean {
  const compareAt = getCompareAtPrice(item);
  return compareAt !== null && compareAt > item.price;
}

export function formatChfPrice(
  price: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(toBcp47Locale(locale), {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
    ...options,
  }).format(price);
}
