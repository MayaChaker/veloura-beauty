import { z } from "zod";

/** Trims a text field and checks its length; the message names the field for the shopper. */
const text = (label: string, max: number, min = 1) =>
  z.string().trim().min(min, `${label} is required.`).max(max, `${label} is too long.`);

/**
 * What the browser may send to POST /api/orders. It names products and quantities only:
 * prices, names and totals are never trusted from the client, the server reads them itself.
 */
export const orderInputSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        variantId: z.string().trim().min(1).max(40).optional(),
        quantity: z.number().int().min(1).max(24),
      }),
    )
    .min(1, "Your bag is empty.")
    .max(30),
  contact: z.object({
    email: z.email("Enter a valid email address.").max(120),
    firstName: text("First name", 60),
    lastName: text("Last name", 60),
    phone: text("Phone", 30, 6),
  }),
  shipping: z.object({
    area: text("City or area", 120),
    street: text("Street", 120),
    building: text("Building", 60),
    floor: z.string().trim().max(60).default(""),
    directions: z.string().trim().max(300).default(""),
    country: text("Country", 60),
    location: z
      .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
      .optional(),
  }),
  // Card, Apple Pay and Whish need a payment provider; until one is connected, only cash.
  paymentMethod: z.literal("cash", "This payment method is not available yet."),
  promoCode: z.string().trim().max(30).default(""),
});

export type OrderInput = z.infer<typeof orderInputSchema>;
