import { OrderError, priceOrder, type PricingProduct } from "./priceOrder";

const concealer: PricingProduct = {
  id: 11,
  name: "Radiant Creamy Concealer",
  image: "/images/products/concealer.webp",
  priceCents: 3400,
  stock: null,
  brand: { name: "NARS" },
  variants: [
    { key: "custard", name: "Custard", priceCents: 3400, stock: 5, image: null },
    { key: "ginger", name: "Ginger", priceCents: 3400, stock: 0, image: "/ginger.webp" },
  ],
};
const perfume: PricingProduct = {
  id: 32,
  name: "N°5 Eau de Parfum",
  image: "/images/products/chanel.webp",
  priceCents: 17500,
  stock: 2,
  brand: { name: "Chanel" },
  variants: [],
};
const products = [concealer, perfume];

const failure = (run: () => unknown) => {
  try {
    run();
  } catch (error) {
    if (error instanceof OrderError) return { message: error.message, status: error.status };
    throw error;
  }
  throw new Error("Expected an OrderError");
};

test("prices lines from the database and snapshots their names", () => {
  const order = priceOrder([{ productId: 11, variantId: "custard", quantity: 2 }], "", products);
  expect(order.lines).toEqual([
    {
      productId: 11,
      variantKey: "custard",
      name: "Radiant Creamy Concealer",
      brand: "NARS",
      shade: "Custard",
      image: "/images/products/concealer.webp",
      unitPriceCents: 3400,
      quantity: 2,
    },
  ]);
  // $68 is under the $75 threshold, so standard delivery ($8) is added.
  expect(order).toMatchObject({ subtotalCents: 6800, shippingCents: 800, totalCents: 7600 });
});

test("applies a valid promotion and free delivery from the same rules as the bag", () => {
  const order = priceOrder([{ productId: 32, quantity: 1 }], "veloura10", products);
  expect(order).toMatchObject({
    promoCode: "VELOURA10",
    subtotalCents: 17500,
    discountCents: 1750,
    shippingCents: 0,
    totalCents: 15750,
  });
  expect(priceOrder([{ productId: 32, quantity: 1 }], "FAKE", products).promoCode).toBeNull();
});

test("the same product and shade sent twice becomes one line", () => {
  const order = priceOrder(
    [
      { productId: 11, variantId: "custard", quantity: 1 },
      { productId: 11, variantId: "custard", quantity: 2 },
    ],
    "",
    products,
  );
  expect(order.lines).toHaveLength(1);
  expect(order.lines[0]?.quantity).toBe(3);
});

test("refuses what is out of stock, missing, or without its shade", () => {
  expect(
    failure(() => priceOrder([{ productId: 11, variantId: "ginger", quantity: 1 }], "", products)),
  ).toEqual({
    message: "Radiant Creamy Concealer in Ginger is out of stock.",
    status: 409,
  });
  expect(failure(() => priceOrder([{ productId: 32, quantity: 3 }], "", products))).toEqual({
    message: "N°5 Eau de Parfum is out of stock.",
    status: 409,
  });
  expect(failure(() => priceOrder([{ productId: 11, quantity: 1 }], "", products)).status).toBe(
    400,
  );
  expect(failure(() => priceOrder([{ productId: 999, quantity: 1 }], "", products)).status).toBe(
    404,
  );
});
