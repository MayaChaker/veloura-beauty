import type { OrderRequest } from "../types/commerce";

/** What POST /api/orders answers with. */
export interface PlacedOrder {
  id: string;
  reference: string;
  placedAt: string;
  totalCents: number;
}

export const orderService = {
  /**
   * Sends the bag to POST /api/orders. Only product ids, shades and quantities are sent: the
   * server prices the order from the database, takes the items off the stock and saves it.
   * Returns the placed order's id (its confirmation page) and reference.
   */
  async create({
    cart,
    contact,
    shipping,
    paymentMethod,
    promoCode,
  }: OrderRequest): Promise<PlacedOrder> {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(({ productId, variantId, quantity }) => ({
          productId,
          ...(variantId ? { variantId } : {}),
          quantity,
        })),
        contact,
        shipping,
        paymentMethod,
        promoCode,
      }),
    });
    const body = (await response.json().catch(() => ({}))) as Partial<PlacedOrder> & {
      error?: string;
    };
    if (!response.ok || !body.id || !body.reference || !body.placedAt || body.totalCents == null) {
      throw new Error(body.error || "Your order could not be placed. Please try again.");
    }

    return {
      id: body.id,
      reference: body.reference,
      placedAt: body.placedAt,
      totalCents: body.totalCents,
    };
  },
};
