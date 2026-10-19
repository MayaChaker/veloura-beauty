import type { Product } from "../../types/commerce";
import {
  EMPTY_FILTERS,
  facetCounts,
  filterAndSortProducts,
  pageCount,
  searchableProductText,
} from "./shopLogic";
import { catalogue } from "../../test/catalogue";

const PRODUCTS = catalogue.products;

test("search covers shade names and product benefits", () => {
  const foundation = PRODUCTS.find(
    (product) => product.slug === "estee-lauder-double-wear",
  ) as Product;
  expect(searchableProductText(foundation)).toContain("6w1 sandalwood");
  expect(
    filterAndSortProducts(PRODUCTS, { ...EMPTY_FILTERS, query: "broad-spectrum" }).map(
      (product) => product.slug,
    ),
  ).toContain("glossier-invisible-shield-spf-35");
});

test("category, brands and price bands combine", () => {
  const results = filterAndSortProducts(PRODUCTS, {
    ...EMPTY_FILTERS,
    category: "makeup",
    brands: ["NARS", "Dior"],
    prices: ["25-50"],
  });
  expect(results.length).toBeGreaterThan(0);
  expect(
    results.every(
      (product) =>
        product.category === "Makeup" &&
        ["NARS", "Dior"].includes(product.brand) &&
        product.price >= 25 &&
        product.price < 50,
    ),
  ).toBe(true);
});

test("a brand page only lists that brand", () => {
  const results = filterAndSortProducts(PRODUCTS, { ...EMPTY_FILTERS, brand: "Chanel" });
  expect(results.length).toBe(PRODUCTS.filter((product) => product.brand === "Chanel").length);
});

test("facet counts ignore their own selection but respect the others", () => {
  const filters = { ...EMPTY_FILTERS, category: "makeup", brands: ["NARS"] };
  const counts = facetCounts(PRODUCTS, filters);
  const makeup = PRODUCTS.filter((product) => product.category === "Makeup");
  // Brand counts still offer every makeup brand, so a second brand can be added.
  expect(Object.fromEntries(counts.brands).Dior).toBe(
    makeup.filter((product) => product.brand === "Dior").length,
  );
  // Price counts only count NARS makeup, because the brand filter is in use.
  const narsTotal = counts.prices.reduce((sum, [, count]) => sum + count, 0);
  expect(narsTotal).toBe(makeup.filter((product) => product.brand === "NARS").length);
});

test("price sorting is correct", () => {
  const low = filterAndSortProducts(PRODUCTS, { ...EMPTY_FILTERS, sort: "price-low" });
  const high = filterAndSortProducts(PRODUCTS, { ...EMPTY_FILTERS, sort: "price-high" });
  expect(low[0]?.price).toBe(Math.min(...PRODUCTS.map((product) => product.price)));
  expect(high[0]?.price).toBe(Math.max(...PRODUCTS.map((product) => product.price)));
});

test("pages hold twelve products", () => {
  expect(pageCount(0)).toBe(1);
  expect(pageCount(12)).toBe(1);
  expect(pageCount(13)).toBe(2);
});
