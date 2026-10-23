/**
 * Placing orders against a real Postgres: prices come from the database, stock goes down in
 * the same transaction, and two shoppers cannot both buy the last one.
 * Run with `npm run test:integration` (see src/test/integration).
 */
import assert from "node:assert/strict";
import { after, afterEach, before, test } from "node:test";
import { orderInput, restore, seededProducts } from "../../test/integration/fixtures";
import { db } from "../../lib/db";
import { orderInputSchema } from "./orderInput";
import { placeOrder } from "./placeOrder";
import { OrderError } from "./priceOrder";

let seeded: Awaited<ReturnType<typeof seededProducts>>;

before(async () => {
  seeded = await seededProducts();
});
afterEach(() => restore(seeded));
after(() => db.$disconnect());

const stockOf = async (id: number) => (await db.product.findUniqueOrThrow({ where: { id } })).stock;
const shadeStock = async () =>
  (
    await db.variant.findUniqueOrThrow({
      where: { productId_key: { productId: seeded.shaded.id, key: seeded.shade.key } },
    })
  ).stock;

test("an order is priced from the database, whatever the browser sends", async () => {
  const { plain } = seeded;
  // A tampered request: a price of 1 cent. The schema drops fields it does not know.
  const input = orderInputSchema.parse({
    ...orderInput([]),
    items: [{ productId: plain.id, quantity: 2, priceCents: 1 }],
    total: 0.01,
  });
  const placed = await placeOrder(input);

  const order = await db.order.findUniqueOrThrow({
    where: { id: placed.id },
    include: { items: true },
  });
  assert.equal(order.subtotalCents, plain.priceCents * 2);
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0]?.unitPriceCents, plain.priceCents);
  assert.equal(order.items[0]?.name, plain.name);
  assert.match(order.reference, /^VB-[2-9A-HJ-NP-Z]{6}$/);
  assert.equal(await stockOf(plain.id), (plain.stock ?? 0) - 2);
});

test("a shade's own stock goes down", async () => {
  const { shaded, shade } = seeded;
  await placeOrder(orderInput([{ productId: shaded.id, variantId: shade.key, quantity: 1 }]));
  assert.equal(await shadeStock(), shade.stock - 1);
});

test("two shoppers buying the last one at the same moment: one gets it, one is told", async () => {
  const { plain } = seeded;
  await db.product.update({ where: { id: plain.id }, data: { stock: 1 } });

  const results = await Promise.allSettled([
    placeOrder(orderInput([{ productId: plain.id, quantity: 1 }])),
    placeOrder(orderInput([{ productId: plain.id, quantity: 1 }])),
  ]);

  const refused = results.filter((result) => result.status === "rejected");
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(refused.length, 1);
  const reason = (refused[0] as PromiseRejectedResult).reason;
  assert.ok(reason instanceof OrderError);
  assert.equal(reason.status, 409);
  // Never below zero.
  assert.equal(await stockOf(plain.id), 0);
});

test("a refused order saves nothing: the transaction is rolled back", async () => {
  const { plain, shaded, shade } = seeded;
  await db.product.update({ where: { id: plain.id }, data: { stock: 0 } });
  const ordersBefore = await db.order.count();

  // The shade is available, the plain product is not: the whole order must fail.
  await assert.rejects(
    placeOrder(
      orderInput([
        { productId: shaded.id, variantId: shade.key, quantity: 1 },
        { productId: plain.id, quantity: 1 },
      ]),
    ),
    (error: unknown) => error instanceof OrderError && error.status === 409,
  );
  assert.equal(await db.order.count(), ordersBefore);
  assert.equal(await shadeStock(), shade.stock);
});
