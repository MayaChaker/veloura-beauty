import { PRODUCTS } from "../../data/products";
import type { Product } from "../../types/commerce";
import { brandHref, brandSlug, createCatalogue } from "./catalogue";

const catalogue = createCatalogue(PRODUCTS);

test("keeps the products in their source order", () => {
  expect(catalogue.products.map((product) => product.id)).toEqual(
    PRODUCTS.map((product) => product.id),
  );
});

test("finds a product by id, accepting ids read back as strings", () => {
  expect(catalogue.getById(10)?.slug).toBe("estee-lauder-double-wear");
  expect(catalogue.getById("10")?.slug).toBe("estee-lauder-double-wear");
  expect(catalogue.getById("missing")).toBeUndefined();
});

test("finds a product by slug", () => {
  expect(catalogue.getBySlug("the-ordinary-hyaluronic-acid-2-b5")?.id).toBe(3);
  expect(catalogue.getBySlug("missing-product")).toBeUndefined();
});

test("getManyByIds keeps the requested order and skips missing ids", () => {
  expect(catalogue.getManyByIds([3, "1", 999, 2]).map((product) => product.id)).toEqual([3, 1, 2]);
  expect(catalogue.getManyByIds()).toEqual([]);
});

test("lists every brand A to Z with its product count", () => {
  const names = catalogue.brands.map((brand) => brand.name);
  expect(names).toEqual(
    [...names].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" })),
  );
  expect(new Set(names).size).toBe(new Set(PRODUCTS.map((product) => product.brand)).size);
  expect(catalogue.getBrand("dior")).toMatchObject({
    name: "Dior",
    productCount: PRODUCTS.filter((product) => product.brand === "Dior").length,
  });
});

test("brand slugs drop accents and punctuation", () => {
  expect(brandSlug("Estée Lauder")).toBe("estee-lauder");
  expect(brandSlug("L'Oréal Professionnel")).toBe("l-oreal-professionnel");
  expect(brandHref("Kevin.Murphy")).toBe("/brands/kevin-murphy");
});

test("attaches the products inside a set so it can be drawn", () => {
  const [first, second] = PRODUCTS;
  if (!first || !second) throw new Error("The catalogue is empty");
  const set: Product = {
    ...first,
    id: 999,
    slug: "test-set",
    type: "set",
    includes: [first.id, second.id],
  };
  const product = createCatalogue([...PRODUCTS, set]).getById(999);
  expect(product?.type === "set" && product.parts?.map((part) => part.id)).toEqual([
    first.id,
    second.id,
  ]);
});
