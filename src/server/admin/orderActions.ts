"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getAdmin } from "../session";
import { changeOrderStatus } from "./orderStatus";

const input = z.object({
  orderId: z.string().min(1).max(64),
  to: z.enum(["Shipped", "Delivered", "Cancelled"]),
});

export type StatusResult = { ok: true } | { ok: false; error: string };

/**
 * Moves an order to its next status, or cancels it. Admins only, like every admin action:
 * the check runs here, not in the page, because a server action can be called directly.
 * The rules and the transaction are in orderStatus.ts.
 */
export async function updateOrderStatus(orderId: string, to: string): Promise<StatusResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Only an admin can change an order." };
  const parsed = input.safeParse({ orderId, to });
  if (!parsed.success) return { ok: false, error: "That change is not possible." };
  const { data } = parsed;

  if (!(await changeOrderStatus(data.orderId, data.to))) {
    return { ok: false, error: "This order has changed since the page loaded. Reload to see it." };
  }
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${data.orderId}`);
  return { ok: true };
}
