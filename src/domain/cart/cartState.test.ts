import { addCartItem, removeCartItem, updateCartItemQuantity } from "./cartState";
import { catalogue } from "../../test/catalogue";

test("adds an item and increments an existing cart line", () => {
  const added = addCartItem(catalogue, [], { productId: 11 });
  expect(added).toHaveLength(1);
  expect(added[0]).toMatchObject({ productId: 11, cartId: "11", quantity: 1 });
  expect(addCartItem(catalogue, added, { productId: 11 })[0]?.quantity).toBe(2);
});

test("adds several at once, capped at stock", () => {
  expect(addCartItem(catalogue, [], { productId: 11 }, 3)[0]?.quantity).toBe(3);
  expect(addCartItem(catalogue, [], { productId: 11 }, 99)[0]?.quantity).toBe(24);
  expect(addCartItem(catalogue, [], { productId: 11 }, 0)).toEqual([]);
});

test("updates quantity within stock and removes zero-quantity lines", () => {
  const items = addCartItem(catalogue, [], { productId: 11 });
  expect(updateCartItemQuantity(catalogue, items, "11", 2)[0]?.quantity).toBe(3);
  expect(updateCartItemQuantity(catalogue, items, "11", -1)).toEqual([]);
});

test("removes only the requested cart line", () => {
  const items = addCartItem(catalogue, addCartItem(catalogue, [], { productId: 11 }), {
    productId: 12,
  });
  expect(removeCartItem(items, "11").map((item) => item.productId)).toEqual([12]);
});
