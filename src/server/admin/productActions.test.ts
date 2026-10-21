/**
 * The admin product action with the session and the database replaced: who may call it, what
 * it accepts, and that a stock changed by an order in the meantime is never overwritten.
 */
export {}; // a module, so its names do not clash with other test files

const getAdmin = jest.fn();
jest.mock("../session", () => ({ getAdmin }));
const revalidatePath = jest.fn();
jest.mock("next/cache", () => ({ revalidatePath }));

const tx = {
  product: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
  variant: { updateMany: jest.fn() },
};
jest.mock("../../lib/db", () => ({
  db: { $transaction: (run: (client: typeof tx) => unknown) => run(tx) },
}));

// Loaded after the mocks above exist (an import would be hoisted above them).
const { updateProduct } = jest.requireActual(
  "./productActions.ts",
) as typeof import("./productActions");

const base = { productId: 11, priceCents: 3400, wasPriceCents: null, stock: null, shades: [] };
const concealer = {
  id: 11,
  variants: [
    { key: "ginger", name: "Ginger" },
    { key: "custard", name: "Custard" },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  getAdmin.mockResolvedValue({ id: "a1", name: "Maya", email: "maya@example.com" });
  tx.product.findUnique.mockResolvedValue(concealer);
  tx.product.updateMany.mockResolvedValue({ count: 1 });
  tx.variant.updateMany.mockResolvedValue({ count: 1 });
});

test("only an admin can change a product", async () => {
  getAdmin.mockResolvedValueOnce(null);
  await expect(updateProduct(base)).resolves.toMatchObject({ ok: false });
  expect(tx.product.update).not.toHaveBeenCalled();
});

test("prices must be whole cents above zero, and a was price above the price", async () => {
  await expect(updateProduct({ ...base, priceCents: 0 })).resolves.toMatchObject({ ok: false });
  await expect(updateProduct({ ...base, priceCents: 34.5 })).resolves.toMatchObject({
    ok: false,
  });
  await expect(updateProduct({ ...base, wasPriceCents: 3000 })).resolves.toEqual({
    ok: false,
    error: "The was price must be higher than the price.",
  });
  expect(tx.product.update).not.toHaveBeenCalled();
});

test("a new price is given to the product and every shade, then the store is rebuilt", async () => {
  await expect(updateProduct({ ...base, priceCents: 3000, wasPriceCents: 3400 })).resolves.toEqual({
    ok: true,
  });
  expect(tx.product.update).toHaveBeenCalledWith({
    where: { id: 11 },
    data: { priceCents: 3000, originalPriceCents: 3400 },
  });
  expect(tx.variant.updateMany).toHaveBeenCalledWith({
    where: { productId: 11 },
    data: { priceCents: 3000 },
  });
  expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
});

test("a shade's stock is only written if it still holds the number the form loaded", async () => {
  await updateProduct({ ...base, shades: [{ key: "ginger", expected: 4, value: 30 }] });
  expect(tx.variant.updateMany).toHaveBeenLastCalledWith({
    where: { productId: 11, key: "ginger", stock: 4 },
    data: { stock: 30 },
  });
});

test("if an order changed the stock meanwhile, nothing is saved and the admin is told", async () => {
  tx.variant.updateMany
    .mockResolvedValueOnce({ count: 5 }) // the price, for every shade
    .mockResolvedValueOnce({ count: 0 }); // Ginger is no longer at 4
  const result = await updateProduct({
    ...base,
    shades: [{ key: "ginger", expected: 4, value: 30 }],
  });
  expect(result).toEqual({ ok: false, error: expect.stringContaining("Ginger’s stock changed") });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("a product without shades checks its own stock the same way", async () => {
  tx.product.findUnique.mockResolvedValueOnce({ id: 3, variants: [] });
  tx.product.updateMany.mockResolvedValueOnce({ count: 0 });
  const result = await updateProduct({ ...base, productId: 3, stock: { expected: 24, value: 50 } });
  expect(tx.product.updateMany).toHaveBeenCalledWith({
    where: { id: 3, stock: 24 },
    data: { stock: 50 },
  });
  expect(result).toMatchObject({ ok: false });
});
