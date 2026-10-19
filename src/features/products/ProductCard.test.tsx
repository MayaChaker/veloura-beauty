import { fireEvent, render, screen } from "@testing-library/react";
import type { Product } from "../../types/commerce";
import ProductCard from "./ProductCard";
import { catalogue, TestProviders } from "../../test/catalogue";

const renderCard = (product: Product) =>
  render(
    <TestProviders>
      <ProductCard product={product} />
    </TestProviders>,
  );

const stored = (key: string) => JSON.parse(window.localStorage.getItem(key) ?? "null");

const catalogueProduct = (product: Product | undefined): Product => {
  if (!product) throw new Error("Expected product is missing from the catalogue");
  return product;
};

test("a shade selection updates the product art and the added cart variant", () => {
  const product = catalogueProduct(catalogue.getBySlug("estee-lauder-double-wear"));
  renderCard(product);
  expect(screen.getByRole("img", { name: product.name })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Choose shade" })).toHaveAttribute(
    "href",
    `/product/${product.slug}`,
  );
  fireEvent.click(screen.getByRole("button", { name: "Select 6W1 Sandalwood shade" }));
  expect(screen.getByRole("img", { name: `${product.name} in 6W1 Sandalwood` })).toBeTruthy();
  expect(screen.getByText("6W1 Sandalwood")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Add to bag" }));
  const cart = stored("velouraBeauty.cart.v2");
  expect(cart[0]).toMatchObject({
    productId: product.id,
    variantId: "deep",
    selectedVariant: "6W1 Sandalwood",
    cartId: `${product.id}:deep`,
  });
  expect(cart[0].swatch).toBe("#7a4a30");
});

test("wishlist remains functional on a refined card", () => {
  const product = catalogueProduct(catalogue.products[0]);
  renderCard(product);
  fireEvent.click(screen.getByRole("button", { name: `Add ${product.name} to wishlist` }));
  expect(stored("velouraBeauty.wishlist.v1")).toEqual([product.id]);
});
