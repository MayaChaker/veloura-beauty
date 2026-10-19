import { resolveProductSelection } from "./productSelection";
import { catalogue } from "../../test/catalogue";

test("resolves a valid product by ID", () => {
  expect(resolveProductSelection(catalogue, 22)).toMatchObject({
    id: 22,
    productId: 22,
    slug: "maybelline-the-city-mini-palette",
    cartId: "22",
  });
});

test("resolves a selected variant with its canonical identity", () => {
  expect(resolveProductSelection(catalogue, 10, "deep")).toMatchObject({
    id: 10,
    name: "Double Wear Stay-in-Place Foundation",
    productId: 10,
    variantId: "deep",
    selectedVariant: "6W1 Sandalwood",
    cartId: "10:deep",
  });
});

test("falls back to the base product when a variant is absent or invalid", () => {
  expect(resolveProductSelection(catalogue, 10)).toMatchObject({ productId: 10, cartId: "10" });
  expect(resolveProductSelection(catalogue, 10, "missing")).toMatchObject({
    productId: 10,
    cartId: "10",
  });
});

test("returns null for a missing product", () => {
  expect(resolveProductSelection(catalogue, 999)).toBeNull();
});
