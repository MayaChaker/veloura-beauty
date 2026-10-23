/**
 * The admin's changes against a real Postgres: status moves, cancelling restocks, and a stock
 * changed by an order while the admin edits is never overwritten. These call the transactions
 * directly; who may call them is checked by the server actions (covered by unit tests).
 * Run with `npm run test:integration` (see src/test/integration).
 */
import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { orderInput, restore, seededProducts } from "../../test/integration/fixtures";
import { db } from "../../lib/db";
import { placeOrder } from "../orders/placeOrder";
import { changeOrderStatus } from "./orderStatus";
import { saveProduct } from "./productUpdate";

let seeded: Awaited<ReturnType<typeof seededProducts>>;

before(async () => {
  seeded = await seededProducts();
});
afterEach(() => restore(seeded));
after(() => db.$disconnect());

const shadeStock = async () =>
  (
    await db.variant.findUniqueOrThrow({
      where: { productId_key: { productId: seeded.shaded.id, key: seeded.shade.key } },
    })
  ).stock;

test("an order moves Placed → Shipped → Delivered, one step at a time", async () => {
  const { id } = await placeOrder(orderInput([{ productId: seeded.plain.id, quantity: 1 }]));

  assert.equal(await changeOrderStatus(id, "Delivered"), false);
  assert.equal(await changeOrderStatus(id, "Shipped"), true);
  assert.equal(await changeOrderStatus(id, "Delivered"), true);
  // Delivered is final: it can no longer be cancelled.
  assert.equal(await changeOrderStatus(id, "Cancelled"), false);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id } })).status, "Delivered");
});

test("cancelling puts the items back in stock, once", async () => {
  const { shaded, shade } = seeded;
  const { id } = await placeOrder(
    orderInput([{ productId: shaded.id, variantId: shade.key, quantity: 2 }]),
  );
  assert.equal(await shadeStock(), shade.stock - 2);

  assert.equal(await changeOrderStatus(id, "Cancelled"), true);
  assert.equal(await shadeStock(), shade.stock);
  // A second click (another tab) must not add the items again.
  assert.equal(await changeOrderStatus(id, "Cancelled"), false);
  assert.equal(await shadeStock(), shade.stock);
});

test("a new price is given to the product and all its shades", async () => {
  const { shaded } = seeded;
  const result = await saveProduct({
    productId: shaded.id,
    priceCents: 1999,
    wasPriceCents: 2500,
    stock: null,
    shades: [],
  });
  assert.deepEqual(result, { ok: true });

  const saved = await db.product.findUniqueOrThrow({
    where: { id: shaded.id },
    include: { variants: true },
  });
  assert.equal(saved.priceCents, 1999);
  assert.equal(saved.originalPriceCents, 2500);
  assert.ok(saved.variants.every((variant) => variant.priceCents === 1999));
});

test("an order during the admin's edit: nothing is saved, the sale is kept", async () => {
  const { shaded, shade } = seeded;
  const loaded = shade.stock; // what the admin's form shows
  // A shopper buys one while the admin is typing.
  await placeOrder(orderInput([{ productId: shaded.id, variantId: shade.key, quantity: 1 }]));

  const result = await saveProduct({
    productId: shaded.id,
    priceCents: 1999,
    wasPriceCents: null,
    stock: null,
    shades: [{ key: shade.key, expected: loaded, value: 50 }],
  });

  assert.equal(result.ok, false);
  assert.equal(await shadeStock(), loaded - 1);
  // The price in the same save was rolled back too.
  const product = await db.product.findUniqueOrThrow({ where: { id: shaded.id } });
  assert.equal(product.priceCents, shaded.priceCents);
});
