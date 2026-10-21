/**
 * The admin status action with the session and the database replaced: who may call it, which
 * moves it accepts, and that cancelling restocks inside the transaction.
 */
export {}; // a module, so its names do not clash with other test files

const getAdmin = jest.fn();
jest.mock("../session", () => ({ getAdmin }));
const revalidatePath = jest.fn();
jest.mock("next/cache", () => ({ revalidatePath }));

const tx = {
  order: { updateMany: jest.fn() },
  orderItem: { findMany: jest.fn() },
  variant: { updateMany: jest.fn() },
  product: { updateMany: jest.fn() },
};
jest.mock("../../lib/db", () => ({
  db: { $transaction: (run: (client: typeof tx) => unknown) => run(tx) },
}));

// Loaded after the mocks above exist (an import would be hoisted above them).
const { updateOrderStatus } = jest.requireActual(
  "./orderActions.ts",
) as typeof import("./orderActions");

const admin = { id: "a1", name: "Maya", email: "maya@example.com" };

beforeEach(() => {
  jest.clearAllMocks();
  getAdmin.mockResolvedValue(admin);
  tx.order.updateMany.mockResolvedValue({ count: 1 });
});

test("only an admin can change an order", async () => {
  getAdmin.mockResolvedValueOnce(null);
  await expect(updateOrderStatus("o1", "Shipped")).resolves.toMatchObject({ ok: false });
  expect(tx.order.updateMany).not.toHaveBeenCalled();
});

test("a status the order cannot move to is refused before the database", async () => {
  await expect(updateOrderStatus("o1", "Placed")).resolves.toMatchObject({ ok: false });
  await expect(updateOrderStatus("", "Shipped")).resolves.toMatchObject({ ok: false });
  expect(tx.order.updateMany).not.toHaveBeenCalled();
});

test("shipping only applies to an order that is still placed", async () => {
  await expect(updateOrderStatus("o1", "Shipped")).resolves.toEqual({ ok: true });
  expect(tx.order.updateMany).toHaveBeenCalledWith({
    where: { id: "o1", status: { in: ["Placed"] } },
    data: { status: "Shipped" },
  });
  expect(revalidatePath).toHaveBeenCalledWith("/admin/orders/o1");
  expect(tx.orderItem.findMany).not.toHaveBeenCalled();
});

test("an order changed in another tab is reported, not overwritten", async () => {
  tx.order.updateMany.mockResolvedValueOnce({ count: 0 });
  const result = await updateOrderStatus("o1", "Delivered");
  expect(result).toEqual({ ok: false, error: expect.stringContaining("Reload") });
  expect(revalidatePath).not.toHaveBeenCalled();
});

test("cancelling puts each item back in stock", async () => {
  tx.orderItem.findMany.mockResolvedValueOnce([
    { productId: 3, variantKey: "custard", quantity: 1 },
    { productId: 7, variantKey: null, quantity: 2 },
  ]);
  await expect(updateOrderStatus("o1", "Cancelled")).resolves.toEqual({ ok: true });
  expect(tx.order.updateMany).toHaveBeenCalledWith({
    where: { id: "o1", status: { in: ["Placed", "Shipped"] } },
    data: { status: "Cancelled" },
  });
  expect(tx.variant.updateMany).toHaveBeenCalledWith({
    where: { productId: 3, key: "custard" },
    data: { stock: { increment: 1 } },
  });
  expect(tx.product.updateMany).toHaveBeenCalledWith({
    where: { id: 7, stock: { not: null } },
    data: { stock: { increment: 2 } },
  });
});
