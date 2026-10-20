import "server-only";
import { cache } from "react";
import type { OrderReceipt } from "../../domain/orders/receipt";
import { db } from "../../lib/db";

const PAYMENT_LABELS = { Cash: "Cash on delivery" } as const;

/**
 * One order by its id, or null. The id is long and random, so knowing it is what lets someone
 * see the order: it is only ever shown to the shopper who placed it.
 */
export const getOrder = cache(async (id: string): Promise<OrderReceipt | null> => {
  const order = await db.order.findUnique({
    where: { id },
    include: { items: { orderBy: { id: "asc" } } },
  });
  if (!order) return null;
  return {
    id: order.id,
    reference: order.reference,
    placedAt: order.createdAt.toISOString(),
    status: order.status,
    payment: PAYMENT_LABELS[order.paymentMethod],
    email: order.email,
    firstName: order.firstName,
    lastName: order.lastName,
    phone: order.phone,
    address: [order.building, order.floor, order.street, order.area].filter(Boolean).join(", "),
    directions: order.directions,
    items: order.items.map((item) => ({
      name: item.name,
      brand: item.brand,
      shade: item.shade,
      image: item.image,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    })),
    promoCode: order.promoCode,
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
  };
});
