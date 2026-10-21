/**
 * Rules for editing a product in the admin, shared by the form and the server action: how a
 * typed price becomes cents, and what a valid change looks like.
 */

/** The most a price may be: $10,000. */
export const MAX_PRICE_CENTS = 1_000_000;
/** The most a product or shade may hold in stock. */
export const MAX_STOCK = 10_000;

/** "34", "34.5" or "34.50" → 3450; null for anything that is not a price. */
export function parseDollars(value: string): number | null {
  const text = value.trim().replace(/^\$/, "");
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(text)) return null;
  const [whole = "0", fraction = ""] = text.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

/** 3450 → "34.50", for a price field. */
export const centsToInput = (cents: number | null) =>
  cents === null ? "" : (cents / 100).toFixed(2);

/** "12" → 12; null unless it is a whole number from 0 to MAX_STOCK. */
export function parseStock(value: string): number | null {
  const text = value.trim();
  if (!/^\d{1,5}$/.test(text)) return null;
  const stock = Number(text);
  return stock <= MAX_STOCK ? stock : null;
}

/** Why a was price cannot be used, or null when it is fine (or empty). */
export function wasPriceProblem(priceCents: number, wasCents: number | null) {
  if (wasCents === null) return null;
  return wasCents > priceCents ? null : "The was price must be higher than the price.";
}
