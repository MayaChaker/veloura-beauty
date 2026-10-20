import { resolveProductSelection, type SelectionInput } from "../product/productSelection";
import type { CartLine, StoredCartLine } from "../../types/commerce";
import type { Catalogue } from "../catalogue/catalogue";
import { DEFAULT_STOCK } from "../commerce/commerceConfig";

/** Bag state may still contain lines loaded from storage before they are resolved. */
export type CartEntry = StoredCartLine | CartLine;

const lineId = (item: CartEntry) => item.cartId || String(item.id);

/** Adds `quantity` of a product (one by default), never beyond its stock. */
export function addCartItem(
  catalogue: Catalogue,
  items: CartEntry[],
  selection: SelectionInput,
  quantity = 1,
): CartEntry[] {
  const variantId = typeof selection === "object" ? selection.variantId : undefined;
  const product = resolveProductSelection(catalogue, selection, variantId);
  if (!product || quantity < 1) return items;
  const stock = product.stock ?? DEFAULT_STOCK;
  if (stock <= 0) return items;

  const existing = items.find((item) => lineId(item) === product.cartId);
  if (!existing) return [...items, { ...product, quantity: Math.min(quantity, stock) }];
  return items.map((item) =>
    lineId(item) === product.cartId
      ? { ...product, quantity: Math.min(Number(item.quantity) + quantity, stock) }
      : item,
  );
}

export function updateCartItemQuantity(
  catalogue: Catalogue,
  items: CartEntry[],
  id: string,
  delta: number,
): CartEntry[] {
  return items
    .map((item): CartEntry => {
      if (lineId(item) !== String(id)) return item;
      const canonical = resolveProductSelection(catalogue, item, item.variantId);
      const stock = canonical?.stock ?? DEFAULT_STOCK;
      return { ...(canonical ?? item), quantity: Math.min(Number(item.quantity) + delta, stock) };
    })
    .filter((item) => Number(item.quantity) > 0);
}

export const removeCartItem = (items: CartEntry[], id: string): CartEntry[] =>
  items.filter((item) => lineId(item) !== String(id));
