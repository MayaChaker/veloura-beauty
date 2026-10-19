import type { Catalogue } from "../catalogue/catalogue";
import type { ProductId, ProductSelection } from "../../types/commerce";

/** Any object that points at a product, e.g. a stored or resolved bag line. */
export interface ProductRef {
  productId?: ProductId;
  id?: ProductId | string;
  variantId?: string;
}

/** Anything that identifies a product: an id, or an object referencing one. */
export type SelectionInput = ProductId | string | ProductRef;

/**
 * Resolves a product (and optional shade) against the catalogue. The catalogue is the
 * source of truth, so stale names or prices in saved data are never trusted.
 */
export function resolveProductSelection(
  catalogue: Catalogue,
  productOrId: SelectionInput,
  variantId = "",
): ProductSelection | null {
  const isObject = typeof productOrId === "object";
  const id = isObject ? productOrId.productId || productOrId.id : productOrId;
  const product = catalogue.getById(id);
  if (!product) return null;

  const requestedVariant = variantId || (isObject ? productOrId.variantId : "") || "";
  const variant = product.variants?.find((item) => item.id === requestedVariant);
  if (!variant) return { ...product, productId: product.id, cartId: String(product.id) };

  return {
    ...product,
    ...variant,
    // The variant's own id and name must not replace the product's.
    id: product.id,
    name: product.name,
    productId: product.id,
    variantId: variant.id,
    selectedVariant: variant.name,
    cartId: `${product.id}:${variant.id}`,
  };
}
