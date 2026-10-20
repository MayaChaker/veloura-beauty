import "server-only";
import { randomInt } from "node:crypto";
import { db } from "../../lib/db";
import type { OrderInput } from "./orderInput";
import { OrderError, priceOrder } from "./priceOrder";

// No 0/O or 1/I, so a reference read over the phone is not misheard.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** A short, readable order reference, e.g. "VB-7K2M9Q". The order's id stays the unguessable one. */
const newReference = () =>
  `VB-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

export interface PlacedOrder {
  id: string;
  reference: string;
  placedAt: string;
  totalCents: number;
}

/**
 * Saves an order and takes its products off the stock in one transaction: either all of it
 * happens, or none of it does. Each stock update only applies while enough is left, so two
 * shoppers buying the last item at the same moment cannot both succeed. A signed-in shopper's
 * order is linked to their account.
 */
export async function placeOrder(input: OrderInput, userId?: string): Promise<PlacedOrder> {
  return db.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) } },
      include: { brand: { select: { name: true } }, variants: true },
    });
    const priced = priceOrder(input.items, input.promoCode, products);

    for (const line of priced.lines) {
      const { count } = line.variantKey
        ? await tx.variant.updateMany({
            where: {
              productId: line.productId,
              key: line.variantKey,
              stock: { gte: line.quantity },
            },
            data: { stock: { decrement: line.quantity } },
          })
        : await tx.product.updateMany({
            where: { id: line.productId, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
      // Someone bought it between our read and this update: throwing rolls everything back.
      if (count === 0) {
        const what = line.shade ? `${line.name} in ${line.shade}` : line.name;
        throw new OrderError(`${what} has just sold out.`, 409);
      }
    }

    const { contact, shipping } = input;
    const order = await tx.order.create({
      data: {
        reference: newReference(),
        userId: userId ?? null,
        paymentMethod: "Cash",
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone,
        area: shipping.area,
        street: shipping.street,
        building: shipping.building,
        floor: shipping.floor,
        directions: shipping.directions,
        country: shipping.country,
        latitude: shipping.location?.lat ?? null,
        longitude: shipping.location?.lng ?? null,
        promoCode: priced.promoCode,
        subtotalCents: priced.subtotalCents,
        discountCents: priced.discountCents,
        shippingCents: priced.shippingCents,
        totalCents: priced.totalCents,
        items: { create: priced.lines },
      },
    });
    return {
      id: order.id,
      reference: order.reference,
      placedAt: order.createdAt.toISOString(),
      totalCents: order.totalCents,
    };
  });
}
