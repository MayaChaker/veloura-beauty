import { paymentLabel } from "../domain/commerce/paymentMethods";
import type { Order, OrderRequest } from "../types/commerce";

/** What POST /api/orders answers with. */
interface PlacedOrder {
  id: string;
  reference: string;
  placedAt: string;
  totalCents: number;
}

export const orderService = {
  /**
   * Sends the bag to POST /api/orders. Only product ids, shades and quantities are sent: the
   * server prices the order from the database, takes the items off the stock and saves it.
   * Returns the order as this browser keeps it for the order history and confirmation page.
   */
  async create({
    cart,
    contact,
    shipping,
    paymentMethod,
    promoCode,
  }: OrderRequest): Promise<Order> {
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
      status: "Placed",
      items: cart,
      contact,
      shipping,
      paymentMethod,
      promoCode,
      // The server's total, not the browser's: it is the amount the courier collects.
      total: body.totalCents / 100,
      payment: paymentLabel(paymentMethod),
    };
  },
};
