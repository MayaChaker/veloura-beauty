import "server-only";
import { LOW_STOCK } from "../../domain/admin/dashboard";
import type { Category, Prisma } from "../../generated/prisma/client";
import { db } from "../../lib/db";

// Only admin pages import this module, and each of them calls requireAdmin first.

const CATEGORIES: Category[] = ["Makeup", "Skincare", "Fragrance", "Hair", "Sets"];

export type ProductTab = "all" | "low-stock" | Lowercase<Category>;

export const parseProductTab = (value: unknown): ProductTab =>
  value === "low-stock" || CATEGORIES.some((category) => category.toLowerCase() === value)
    ? (value as ProductTab)
    : "all";

/** A product, or any of its shades, at or below LOW_STOCK. */
const lowStockWhere: Prisma.ProductWhereInput = {
  OR: [{ stock: { lte: LOW_STOCK } }, { variants: { some: { stock: { lte: LOW_STOCK } } } }],
};

const searchWhere = (query: string): Prisma.ProductWhereInput => ({
  AND: query
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => ({
      OR: [
        { name: { contains: word, mode: "insensitive" } },
        { brand: { name: { contains: word, mode: "insensitive" } } },
      ],
    })),
});

export interface AdminProductRow {
  id: number;
  name: string;
  brand: string;
  category: Category;
  image: string | null;
  priceCents: number;
  /** The product's own stock, or the sum of its shades. */
  stock: number;
  /** The smallest stock among the product or its shades, for the low-stock colour. */
  lowest: number;
  shades: number;
}

export async function getAdminProducts(tab: ProductTab, query: string) {
  const search = searchWhere(query);
  const category = CATEGORIES.find((item) => item.toLowerCase() === tab);
  const where: Prisma.ProductWhereInput = {
    ...search,
    ...(category ? { category } : {}),
    ...(tab === "low-stock" ? lowStockWhere : {}),
  };

  const [products, byCategory, lowCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { position: "asc" },
      include: {
        brand: { select: { name: true } },
        variants: { select: { stock: true } },
      },
    }),
    db.product.groupBy({ by: ["category"], where: search, _count: { _all: true } }),
    db.product.count({ where: { AND: [search, lowStockWhere] } }),
  ]);

  const rows: AdminProductRow[] = products.map((product) => {
    const stocks = product.variants.length
      ? product.variants.map((variant) => variant.stock)
      : [product.stock ?? 0];
    return {
      id: product.id,
      name: product.name,
      brand: product.brand.name,
      category: product.category,
      image: product.image,
      priceCents: product.priceCents,
      stock: stocks.reduce((sum, stock) => sum + stock, 0),
      lowest: Math.min(...stocks),
      shades: product.variants.length,
    };
  });

  // Only categories that have products get a tab.
  const tabs = [
    {
      key: "all" as ProductTab,
      label: "All",
      count: byCategory.reduce((sum, group) => sum + group._count._all, 0),
    },
    ...CATEGORIES.flatMap((name) => {
      const count = byCategory.find((group) => group.category === name)?._count._all ?? 0;
      return count ? [{ key: name.toLowerCase() as ProductTab, label: name, count }] : [];
    }),
    { key: "low-stock" as ProductTab, label: "Low stock", count: lowCount },
  ];
  return { rows, tabs };
}

/** One product with its shades, and how many sold in the last 30 days, or null. */
export async function getAdminProduct(id: number) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [product, sold] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        brand: { select: { name: true } },
        variants: { orderBy: { position: "asc" } },
      },
    }),
    db.orderItem.aggregate({
      where: { productId: id, order: { status: { not: "Cancelled" }, createdAt: { gte: since } } },
      _sum: { quantity: true },
    }),
  ]);
  if (!product) return null;
  return { ...product, soldLast30Days: sold._sum.quantity ?? 0 };
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;
