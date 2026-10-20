import { orderInputSchema } from "./orderInput";

const valid = {
  items: [{ productId: 11, variantId: "custard", quantity: 2 }],
  contact: {
    email: "maya@example.com",
    firstName: "Maya",
    lastName: "Chaker",
    phone: "+961 3 123 456",
  },
  shipping: {
    area: "Tripoli, El Mina",
    street: "Port street",
    building: "Building 3",
    country: "Lebanon",
  },
  paymentMethod: "cash",
};

const issue = (input: unknown) => orderInputSchema.safeParse(input).error?.issues[0]?.message;

test("accepts a complete order and fills the optional fields", () => {
  const parsed = orderInputSchema.parse(valid);
  expect(parsed.shipping).toMatchObject({ floor: "", directions: "" });
  expect(parsed.promoCode).toBe("");
});

test("drops anything the server does not ask for, such as a price", () => {
  const parsed = orderInputSchema.parse({
    ...valid,
    items: [{ productId: 11, variantId: "custard", quantity: 2, price: 0.01 }],
    total: 0.01,
  });
  expect(parsed.items[0]).not.toHaveProperty("price");
  expect(parsed).not.toHaveProperty("total");
});

test("only cash on delivery can be used until a payment provider is connected", () => {
  expect(issue({ ...valid, paymentMethod: "card" })).toBe(
    "This payment method is not available yet.",
  );
});

test("rejects missing or malformed details with a message the shopper can act on", () => {
  expect(issue({ ...valid, contact: { ...valid.contact, email: "maya" } })).toBe(
    "Enter a valid email address.",
  );
  expect(issue({ ...valid, shipping: { ...valid.shipping, street: "   " } })).toBe(
    "Street is required.",
  );
  expect(issue({ ...valid, items: [] })).toBe("Your bag is empty.");
});

test("rejects impossible quantities and ids", () => {
  expect(
    orderInputSchema.safeParse({ ...valid, items: [{ productId: 11, quantity: 0 }] }).success,
  ).toBe(false);
  expect(
    orderInputSchema.safeParse({ ...valid, items: [{ productId: -1, quantity: 1 }] }).success,
  ).toBe(false);
  expect(
    orderInputSchema.safeParse({ ...valid, items: [{ productId: 11, quantity: 1.5 }] }).success,
  ).toBe(false);
});
