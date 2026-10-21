import type { OrderStatus } from "./summary";

/**
 * The only moves an order can make: Placed → Shipped → Delivered, or Cancelled before it is
 * delivered. Anything else (Delivered back to Placed, skipping Shipped) is refused on the
 * server, whatever a button sends.
 */
const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  Placed: "Shipped",
  Shipped: "Delivered",
};

const CANCELLABLE: readonly OrderStatus[] = ["Placed", "Shipped"];

/** The status that follows this one, or null once the order is delivered or cancelled. */
export const nextStatus = (status: OrderStatus): OrderStatus | null => NEXT[status] ?? null;

export const canCancel = (status: OrderStatus) => CANCELLABLE.includes(status);

/** The statuses an order may be in to move to `to`. */
export const statusesBefore = (to: OrderStatus): OrderStatus[] =>
  to === "Cancelled"
    ? [...CANCELLABLE]
    : (Object.keys(NEXT) as OrderStatus[]).filter((from) => NEXT[from] === to);

/** What the admin button says for each move. */
export const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  Shipped: "Mark as shipped",
  Delivered: "Mark as delivered",
};
