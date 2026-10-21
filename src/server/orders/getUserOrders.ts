import "server-only";
import type { OrderSummary } from "../../domain/orders/summary";
import { db } from "../../lib/db";

/** A user's orders, newest first. The user id always comes from the session (see requireUser). */
export async function getUserOrders(userId: string, take?: number): Promise<OrderSummary[]> {
  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    include: { items: { orderBy: { id: "asc" } } },
  });
  return orders.map((order) => ({
    id: order.id,
    reference: order.reference,
    placedAt: order.createdAt.toISOString(),
    status: order.status,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: order.totalCents,
    images: order.items.slice(0, 4).map((item) => ({ src: item.image, alt: item.name })),
  }));
}
