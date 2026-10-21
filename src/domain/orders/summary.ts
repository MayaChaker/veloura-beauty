/** An order in a shopper's history: enough for a row, without the address. */
export interface OrderSummary {
  id: string;
  reference: string;
  /** ISO 8601 timestamp. */
  placedAt: string;
  status: OrderStatus;
  itemCount: number;
  totalCents: number;
  /** Up to four product photographs, from the order's snapshot. */
  images: Array<{ src: string | null; alt: string }>;
}

export type OrderStatus = "Placed" | "Shipped" | "Delivered" | "Cancelled";

/** The steps an order goes through, in order. A cancelled order leaves the track. */
export const ORDER_STEPS: readonly OrderStatus[] = ["Placed", "Shipped", "Delivered"];

/** How far along the track an order is: 1 for placed, 3 for delivered, 0 when cancelled. */
export const stepsDone = (status: OrderStatus) => ORDER_STEPS.indexOf(status) + 1;

export const isOpen = (status: OrderStatus) => status === "Placed" || status === "Shipped";

export const formatOrderDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
