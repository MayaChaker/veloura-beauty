import "server-only";
import { statusesBefore } from "../../domain/orders/status";
import type { OrderStatus } from "../../domain/orders/summary";
import { db } from "../../lib/db";

/**
 * Moves an order to `to`, and returns false if it can no longer go there. The caller has
 * already checked that the user is an admin (see orderActions.ts).
 *
 * The update only applies while the order is still in a status that may move to `to`, so two
 * admins clicking at once (or a stale tab) cannot ship a cancelled order or cancel it twice.
 * Cancelling puts the items back in stock in the same transaction.
 */
export function changeOrderStatus(orderId: string, to: Exclude<OrderStatus, "Placed">) {
  return db.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: orderId, status: { in: statusesBefore(to) } },
      data: { status: to },
    });
    if (count === 0) return false;

    if (to === "Cancelled") {
      const items = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of items) {
        // updateMany, not update: a product removed since the order is simply skipped.
        if (item.variantKey) {
          await tx.variant.updateMany({
            where: { productId: item.productId, key: item.variantKey },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.updateMany({
            where: { id: item.productId, stock: { not: null } },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }
    return true;
  });
}
