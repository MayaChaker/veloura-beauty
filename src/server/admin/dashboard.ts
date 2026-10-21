import "server-only";
import {
  LOW_STOCK,
  STORE_TIME_ZONE,
  dayKeys,
  formatAge,
  storeDay,
  summarize,
  type DayTotals,
  type RangeDays,
} from "../../domain/admin/dashboard";
import { Prisma } from "../../generated/prisma/client";
import { db } from "../../lib/db";

// Only the admin overview imports this module, and it calls requireAdmin first.
//
// Aggregations Prisma's query API cannot express (per-day buckets, SUM of price × quantity)
// are written in SQL with the $queryRaw template: every ${value} is sent as a parameter, never
// pasted into the SQL text, so it is as safe from SQL injection as the rest of Prisma.

/** createdAt is stored in UTC; this is its date in Beirut, e.g. '2026-10-22'. */
const storeDaySql = (column: string) =>
  Prisma.raw(
    `to_char((${column} AT TIME ZONE 'UTC') AT TIME ZONE '${STORE_TIME_ZONE}', 'YYYY-MM-DD')`,
  );

/** Revenue and order counts per day: one GROUP BY for the chart and every total above it. */
function dailyTotals(since: Date) {
  return db.$queryRaw<DayTotals[]>`
    SELECT ${storeDaySql('"createdAt"')} AS "day",
           COALESCE(SUM("totalCents") FILTER (WHERE "status" <> 'Cancelled'), 0)::int AS "revenueCents",
           (COUNT(*) FILTER (WHERE "status" <> 'Cancelled'))::int AS "orders",
           (COUNT(*) FILTER (WHERE "status" = 'Cancelled'))::int AS "cancelled"
      FROM "Order"
     WHERE "createdAt" >= ${since}
     GROUP BY 1`;
}

export interface BestSeller {
  productId: number;
  name: string;
  brand: string;
  image: string | null;
  units: number;
  revenueCents: number;
}

/** The products sold most since `firstDay`, by units, from the order lines' snapshots. */
function bestSellers(firstDay: string, since: Date) {
  return db.$queryRaw<BestSeller[]>`
    SELECT i."productId",
           MAX(i."name") AS "name",
           MAX(i."brand") AS "brand",
           MAX(i."image") AS "image",
           SUM(i."quantity")::int AS "units",
           SUM(i."quantity" * i."unitPriceCents")::int AS "revenueCents"
      FROM "OrderItem" i
      JOIN "Order" o ON o."id" = i."orderId"
     WHERE o."status" <> 'Cancelled'
       AND o."createdAt" >= ${since}
       AND ${storeDaySql('o."createdAt"')} >= ${firstDay}
     GROUP BY i."productId"
     ORDER BY "units" DESC, "revenueCents" DESC
     LIMIT 5`;
}

export interface LowStockLine {
  key: string;
  productId: number;
  name: string;
  detail: string;
  image: string | null;
  stock: number;
}

/** Products and shades at or below LOW_STOCK, fewest first. */
async function lowStock(): Promise<LowStockLine[]> {
  const [products, variants] = await Promise.all([
    db.product.findMany({
      where: { stock: { lte: LOW_STOCK } },
      orderBy: { stock: "asc" },
      take: 6,
      select: {
        id: true,
        slug: true,
        name: true,
        image: true,
        stock: true,
        brand: { select: { name: true } },
      },
    }),
    db.variant.findMany({
      where: { stock: { lte: LOW_STOCK } },
      orderBy: { stock: "asc" },
      take: 6,
      select: {
        key: true,
        name: true,
        image: true,
        stock: true,
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
            brand: { select: { name: true } },
          },
        },
      },
    }),
  ]);
  return [
    ...products.map((product) => ({
      key: product.slug,
      productId: product.id,
      name: product.name,
      detail: product.brand.name,
      image: product.image,
      stock: product.stock ?? 0,
    })),
    ...variants.map((variant) => ({
      key: `${variant.product.slug}/${variant.key}`,
      productId: variant.product.id,
      name: variant.product.name,
      detail: `${variant.product.brand.name} · ${variant.name}`,
      image: variant.image ?? variant.product.image,
      stock: variant.stock,
    })),
  ]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);
}

/** Orders waiting to be shipped, oldest first: the ones to send out next. */
async function toShip(now: Date) {
  const orders = await db.order.findMany({
    where: { status: "Placed" },
    orderBy: { createdAt: "asc" },
    take: 5,
    include: { items: { select: { quantity: true } } },
  });
  return orders.map((order) => ({
    id: order.id,
    reference: order.reference,
    name: `${order.firstName} ${order.lastName}`.trim(),
    area: order.area,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    totalCents: order.totalCents,
    age: formatAge(order.createdAt, now),
  }));
}

/** Everything on the admin overview for the last `days` days, compared with the days before. */
export async function getDashboard(days: RangeDays, now = new Date()) {
  const today = storeDay(now);
  const current = dayKeys(today, days);
  const previous = dayKeys(today, days, days);
  // A day of margin on each side of the UTC cut-off; the day keys decide what counts.
  const since = new Date(now.getTime() - (days * 2 + 1) * 24 * 60 * 60 * 1000);
  const firstDay = current[0] ?? today;

  const [rows, best, low, waiting, waitingCount, oldest] = await Promise.all([
    dailyTotals(since),
    bestSellers(firstDay, since),
    lowStock(),
    toShip(now),
    db.order.count({ where: { status: "Placed" } }),
    db.order.findFirst({
      where: { status: "Placed" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ]);

  return {
    days,
    summary: summarize(rows, current, previous),
    bestSellers: best,
    lowStock: low,
    toShip: waiting,
    toShipCount: waitingCount,
    oldestWaiting: oldest ? formatAge(oldest.createdAt, now) : null,
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
