import "server-only";
import type { OrderStatus } from "../../domain/orders/summary";
import type { Prisma } from "../../generated/prisma/client";
import { db } from "../../lib/db";

// Only admin pages import this module, and each of them calls requireAdmin first.

export const ADMIN_TABS = [
  { key: "all", label: "All", status: null },
  { key: "to-ship", label: "To ship", status: "Placed" },
  { key: "shipped", label: "Shipped", status: "Shipped" },
  { key: "delivered", label: "Delivered", status: "Delivered" },
  { key: "cancelled", label: "Cancelled", status: "Cancelled" },
] as const satisfies ReadonlyArray<{ key: string; label: string; status: OrderStatus | null }>;

export type AdminTab = (typeof ADMIN_TABS)[number]["key"];

/** The newest orders shown at once; older ones are reached by searching. */
export const PAGE_SIZE = 50;

export interface AdminOrderRow {
  id: string;
  reference: string;
  placedAt: string;
  name: string;
  phone: string;
  area: string;
  itemCount: number;
  totalCents: number;
  status: OrderStatus;
}

/**
 * Each word of the search must match the reference, the name, the email or the phone, so
 * "maya hamra" or "VB-7K2" both work. Prisma sends the words as parameters, never as SQL.
 */
const searchWhere = (query: string): Prisma.OrderWhereInput => ({
  AND: query
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => ({
      OR: (["reference", "firstName", "lastName", "email", "phone", "area"] as const).map(
        (field) => ({ [field]: { contains: word, mode: "insensitive" } }),
      ),
    })),
});

export async function getAdminOrders(tab: AdminTab, query: string) {
  const status = ADMIN_TABS.find((item) => item.key === tab)?.status ?? null;
  const search = searchWhere(query);
  const where: Prisma.OrderWhereInput = status ? { ...search, status } : search;

  const [orders, total, byStatus] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      include: { items: { select: { quantity: true } } },
    }),
    db.order.count({ where }),
    // One query for every tab's count: GROUP BY status.
    db.order.groupBy({ by: ["status"], where: search, _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(
    ADMIN_TABS.map((item) => [
      item.key,
      byStatus
        .filter((group) => item.status === null || group.status === item.status)
        .reduce((sum, group) => sum + group._count._all, 0),
    ]),
  ) as Record<AdminTab, number>;

  const rows: AdminOrderRow[] = orders.map((order) => ({
    id: order.id,
    reference: order.reference,
    placedAt: order.createdAt.toISOString(),
    name: `${order.firstName} ${order.lastName}`.trim(),
    phone: order.phone,
    area: order.area,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: order.totalCents,
    status: order.status,
  }));
  return { rows, total, counts };
}

/** Orders waiting to be shipped, for the badge in the admin menu. */
export const countToShip = () => db.order.count({ where: { status: "Placed" } });

/** One order with everything the admin needs to deliver it, or null. */
export async function getAdminOrder(id: string) {
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: { orderBy: { id: "asc" } },
      user: { select: { _count: { select: { orders: true } } } },
    },
  });
  if (!order) return null;
  return {
    ...order,
    placedAt: order.createdAt.toISOString(),
    accountOrders: order.user?._count.orders ?? null,
  };
}
