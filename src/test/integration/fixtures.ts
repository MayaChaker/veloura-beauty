import "./guard";
import { db } from "../../lib/db";
import type { OrderInput } from "../../server/orders/orderInput";

/** Every order the tests place uses this email, so they can all be removed afterwards. */
export const TEST_EMAIL = "integration@example.com";

export const orderInput = (items: OrderInput["items"]): OrderInput => ({
  items,
  contact: { email: TEST_EMAIL, firstName: "Test", lastName: "Shopper", phone: "+961 3 000 000" },
  shipping: {
    area: "Tripoli",
    street: "Port street",
    building: "3",
    floor: "",
    directions: "",
    country: "Lebanon",
  },
  paymentMethod: "cash",
  promoCode: "",
});

/** A seeded product without shades, and one with shades, read from the database. */
export async function seededProducts() {
  const plain = await db.product.findFirstOrThrow({
    where: { variants: { none: {} }, stock: { not: null } },
    orderBy: { id: "asc" },
  });
  const shaded = await db.product.findFirstOrThrow({
    where: { variants: { some: {} } },
    orderBy: { id: "asc" },
    include: { variants: { orderBy: { position: "asc" } } },
  });
  return { plain, shaded, shade: shaded.variants[0]! };
}

/** Puts back prices and stock as they were, and removes the tests' orders. */
export async function restore(snapshot: Awaited<ReturnType<typeof seededProducts>>) {
  await db.order.deleteMany({ where: { email: TEST_EMAIL } });
  await db.product.update({
    where: { id: snapshot.plain.id },
    data: {
      stock: snapshot.plain.stock,
      priceCents: snapshot.plain.priceCents,
      originalPriceCents: snapshot.plain.originalPriceCents,
    },
  });
  await db.product.update({
    where: { id: snapshot.shaded.id },
    data: {
      priceCents: snapshot.shaded.priceCents,
      originalPriceCents: snapshot.shaded.originalPriceCents,
    },
  });
  for (const variant of snapshot.shaded.variants) {
    await db.variant.update({
      where: { productId_key: { productId: variant.productId, key: variant.key } },
      data: { stock: variant.stock, priceCents: variant.priceCents },
    });
  }
}
