"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { statusesBefore } from "../../domain/orders/status";
import { db } from "../../lib/db";
import { getAdmin } from "../session";

const input = z.object({
  orderId: z.string().min(1).max(64),
  to: z.enum(["Shipped", "Delivered", "Cancelled"]),
});

export type StatusResult = { ok: true } | { ok: false; error: string };

/**
 * Moves an order to its next status, or cancels it. Admins only, like every admin action:
 * the check runs here, not in the page, because a server action can be called directly.
 *
 * The update only applies while the order is still in a status that may move to `to`, so two
 * admins clicking at once (or a stale tab) cannot ship a cancelled order or cancel it twice.
 * Cancelling puts the items back in stock in the same transaction.
 */
export async function updateOrderStatus(orderId: string, to: string): Promise<StatusResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Only an admin can change an order." };
  const parsed = input.safeParse({ orderId, to });
  if (!parsed.success) return { ok: false, error: "That change is not possible." };
  const { data } = parsed;

  const changed = await db.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: data.orderId, status: { in: statusesBefore(data.to) } },
      data: { status: data.to },
    });
    if (count === 0) return false;

    if (data.to === "Cancelled") {
      const items = await tx.orderItem.findMany({ where: { orderId: data.orderId } });
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

  if (!changed) {
    return { ok: false, error: "This order has changed since the page loaded. Reload to see it." };
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${data.orderId}`);
  return { ok: true };
}
