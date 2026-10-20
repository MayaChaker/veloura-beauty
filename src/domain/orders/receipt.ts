/**
 * A placed order as the shopper sees it, on the confirmation page and in the confirmation
 * email. Read from the database; every amount is in whole cents.
 */
export interface OrderReceipt {
  id: string;
  reference: string;
  /** ISO 8601 timestamp. */
  placedAt: string;
  status: string;
  payment: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  /** One line, e.g. "Building 3, 2nd floor, Port street, Tripoli". */
  address: string;
  directions: string;
  items: Array<{
    name: string;
    brand: string;
    shade: string | null;
    image: string | null;
    quantity: number;
    unitPriceCents: number;
  }>;
  promoCode: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
}

/** 3860 → "$38.60". */
export const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export const itemCount = (receipt: Pick<OrderReceipt, "items">) =>
  receipt.items.reduce((sum, item) => sum + item.quantity, 0);
