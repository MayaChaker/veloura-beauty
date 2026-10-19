import { toProduct, type ProductRecord } from "./productRecord";

const record: ProductRecord = {
  id: 11,
  slug: "nars-radiant-creamy-concealer",
  name: "Radiant Creamy Concealer",
  brand: { name: "NARS" },
  category: "Makeup",
  subcategory: null,
  priceCents: 3400,
  originalPriceCents: null,
  size: "6 ml",
  badge: null,
  isNew: false,
  isBestseller: true,
  note: "Creamy medium-coverage concealer",
  description: "A creamy concealer.",
  ingredients: "Vitamin C",
  benefits: ["Buildable coverage"],
  texture: "Creamy liquid",
  finish: "Natural radiant",
  ritual: "Dot and tap in.",
  routineStep: "Complexion · Conceal",
  matches: ["Natural coverage"],
  type: "wand",
  packaging: "lacquer",
  color: "sand",
  includes: [],
  stock: null,
  image: "/images/products/nars-radiant-creamy-concealer.webp",
  gallery: [],
  variants: [
    {
      key: "custard",
      name: "Custard",
      swatch: "#e2c09f",
      priceCents: 3450,
      stock: 0,
      image: null,
    },
  ],
};

test("turns cents into dollars and database names into the storefront's", () => {
  const product = toProduct(record);
  expect(product).toMatchObject({
    brand: "NARS",
    price: 34,
    order: "Complexion · Conceal",
    type: "wand",
    packaging: "lacquer",
  });
  expect(product.variants).toEqual([
    { id: "custard", name: "Custard", swatch: "#e2c09f", price: 34.5, stock: 0, image: undefined },
  ]);
});

test("database nulls and empty lists become missing fields", () => {
  const product = toProduct({ ...record, variants: [], stock: 12 });
  expect(product.subcategory).toBeUndefined();
  expect(product.originalPrice).toBeUndefined();
  expect(product.badge).toBeUndefined();
  expect(product.gallery).toBeUndefined();
  expect(product.variants).toBeUndefined();
  expect(product.stock).toBe(12);
});

test("a set keeps the ids of the products inside it", () => {
  const product = toProduct({ ...record, type: "set", packaging: null, includes: [1, 2] });
  expect(product).toMatchObject({ type: "set", includes: [1, 2] });
});
