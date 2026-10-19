import { resolveProductSelection } from "../product/productSelection";
import type { CartLine } from "../../types/commerce";
import type { Catalogue } from "../catalogue/catalogue";
import type { CartEntry } from "./cartState";

/** Turns saved bag lines into catalogue-backed lines, dropping products that no longer exist. */
export function resolveCart(catalogue: Catalogue, items: CartEntry[] = []): CartLine[] {
  return items
    .map((item): CartLine | null => {
      const canonical = resolveProductSelection(catalogue, item, item.variantId);
      return canonical ? { ...canonical, quantity: Math.max(1, Number(item.quantity) || 1) } : null;
    })
    .filter((line): line is CartLine => line !== null);
}
