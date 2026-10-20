import { calculateTotals, findPromotion, normalizePromoCode } from "../../domain/cart/pricing";
import type { OrderInput } from "./orderInput";

/** An error the shopper can act on, with the HTTP status the API answers with. */
export class OrderError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409,
  ) {
    super(message);
    this.name = "OrderError";
  }
}

/** The fields pricing needs from a product row, with its shades. */
export interface PricingProduct {
  id: number;
  name: string;
  image: string | null;
  priceCents: number;
  stock: number | null;
  brand: { name: string };
  variants: Array<{
    key: string;
    name: string;
    priceCents: number;
    stock: number;
    image: string | null;
  }>;
}

export interface PricedLine {
  productId: number;
  variantKey: string | null;
  name: string;
  brand: string;
  shade: string | null;
  image: string | null;
  unitPriceCents: number;
  quantity: number;
}

export interface PricedOrder {
  lines: PricedLine[];
  promoCode: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}

const cents = (dollars: number) => Math.round(dollars * 100);

/** The same product and shade asked for twice counts as one line. */
function mergeItems(items: OrderInput["items"]) {
  const merged = new Map<string, OrderInput["items"][number]>();
  for (const item of items) {
    const key = `${item.productId}:${item.variantId ?? ""}`;
    const existing = merged.get(key);
    merged.set(key, existing ? { ...existing, quantity: existing.quantity + item.quantity } : item);
  }
  return [...merged.values()];
}

/**
 * Prices an order from the database's products, never from what the browser sent. Checks that
 * every product and shade exists and has enough stock; the stock is taken off separately, inside
 * the transaction that saves the order.
 */
export function priceOrder(
  items: OrderInput["items"],
  promoCode: string,
  products: PricingProduct[],
): PricedOrder {
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines = mergeItems(items).map((item): PricedLine => {
    const product = byId.get(item.productId);
    if (!product) throw new OrderError("A product in your bag is no longer available.", 404);

    if (product.variants.length) {
      const shade = product.variants.find((variant) => variant.key === item.variantId);
      if (!shade) throw new OrderError(`Choose a shade for ${product.name}.`, 400);
      if (shade.stock < item.quantity)
        throw new OrderError(`${product.name} in ${shade.name} is out of stock.`, 409);
      return {
        productId: product.id,
        variantKey: shade.key,
        name: product.name,
        brand: product.brand.name,
        shade: shade.name,
        image: shade.image ?? product.image,
        unitPriceCents: shade.priceCents,
        quantity: item.quantity,
      };
    }

    if ((product.stock ?? 0) < item.quantity)
      throw new OrderError(`${product.name} is out of stock.`, 409);
    return {
      productId: product.id,
      variantKey: null,
      name: product.name,
      brand: product.brand.name,
      shade: null,
      image: product.image,
      unitPriceCents: product.priceCents,
      quantity: item.quantity,
    };
  });

  // The storefront's own pricing rules (promotion, free-delivery threshold), fed with database prices.
  const code = findPromotion(promoCode) ? normalizePromoCode(promoCode) : "";
  const totals = calculateTotals(
    lines.map((line) => ({ price: line.unitPriceCents / 100, quantity: line.quantity })),
    code,
  );
  return {
    lines,
    promoCode: code || null,
    subtotalCents: cents(totals.subtotal),
    discountCents: cents(totals.discount),
    shippingCents: cents(totals.shipping),
    totalCents: cents(totals.total),
  };
}
