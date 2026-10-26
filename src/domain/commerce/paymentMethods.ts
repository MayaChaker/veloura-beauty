import type { PaymentMethod } from "../../types/commerce";

export interface PaymentOption {
  id: PaymentMethod;
  label: string;
  note: string;
  /** False until a payment provider is connected: shown, but cannot be chosen. */
  available: boolean;
}

/**
 * The ways to pay shown at checkout. Only cash on delivery takes orders: card, Apple Pay and
 * Whish need a payment provider, so they are shown as coming soon rather than pretending to
 * charge. The API accepts cash only (see server/orders/orderInput.ts).
 */
export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { id: "card", label: "Credit or debit card", note: "Visa, Mastercard", available: false },
  { id: "apple-pay", label: "Apple Pay", note: "Pay with Face ID or Touch ID", available: false },
  { id: "whish", label: "Whish Money", note: "Pay from your Whish wallet", available: false },
  {
    id: "cash",
    label: "Cash on delivery",
    note: "Pay the courier when your order arrives",
    available: true,
  },
];
