import type { OrderReceipt } from "../domain/orders/receipt";

/** An order as the server returns it, for confirmation page and email tests. */
export const receipt: OrderReceipt = {
  id: "cm2x8fq0000demo",
  reference: "VB-7K2M9Q",
  placedAt: "2026-10-20T10:00:00.000Z",
  status: "Placed",
  payment: "Cash on delivery",
  email: "maya@example.com",
  firstName: "Maya",
  lastName: "Chaker",
  phone: "+961 3 123 456",
  address: "Building 3, Port street, Tripoli, El Mina",
  directions: "",
  items: [
    {
      name: "Radiant Creamy Concealer",
      brand: "NARS",
      shade: "Custard",
      image: null,
      quantity: 2,
      unitPriceCents: 3400,
    },
  ],
  promoCode: "VELOURA10",
  subtotalCents: 6800,
  discountCents: 680,
  shippingCents: 800,
  totalCents: 6920,
};
