import { resolveCart } from "./cart";
import { catalogue } from "../../test/catalogue";

test("canonicalizes persisted product data while preserving quantity", () => {
  const [item] = resolveCart(catalogue, [
    { productId: 22, cartId: "22", quantity: 3, name: "Old name", image: "/wrong.webp", price: 1 },
  ]);
  expect(item).toMatchObject({
    name: "The City Mini Eyeshadow Palette",
    price: 10,
    quantity: 3,
    cartId: "22",
  });
  // Stale fields from older saved carts must not leak through: the image comes from the catalogue.
  expect(item?.image).toBe("/images/products/maybelline-the-city-mini-palette.webp");
});

test("preserves variant identity when canonicalizing cart lines", () => {
  const [item] = resolveCart(catalogue, [
    { productId: 10, variantId: "light", cartId: "10:light", quantity: 2 },
  ]);
  expect(item).toMatchObject({
    productId: 10,
    variantId: "light",
    selectedVariant: "2W1 Dawn",
    cartId: "10:light",
    quantity: 2,
  });
});

test("drops missing catalogue entries and normalizes invalid quantities", () => {
  expect(resolveCart(catalogue, [{ productId: 999, quantity: 2 }])).toEqual([]);
  expect(resolveCart(catalogue, [{ productId: 11, quantity: 0 }])[0]?.quantity).toBe(1);
});
