"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MAX_PRICE_CENTS, MAX_STOCK, wasPriceProblem } from "../../domain/admin/products";
import { db } from "../../lib/db";
import { getAdmin } from "../session";

const cents = z.number().int().min(1).max(MAX_PRICE_CENTS);
/** A stock change: what the form loaded, and what the admin typed. */
const stockChange = z.object({
  expected: z.number().int().min(0),
  value: z.number().int().min(0).max(MAX_STOCK),
});

const input = z.object({
  productId: z.number().int().positive(),
  priceCents: cents,
  wasPriceCents: cents.nullable(),
  /** For a product without shades. */
  stock: stockChange.nullable(),
  /** For a product with shades, one per shade that changed. */
  shades: z.array(stockChange.extend({ key: z.string().min(1).max(64) })).max(100),
});

export type ProductUpdate = z.infer<typeof input>;
export type ProductResult = { ok: true } | { ok: false; error: string };

/** Thrown inside the transaction so that nothing is saved; turned into a message below. */
class StockChanged extends Error {}

/**
 * Saves a product's price, was price and stock. Admins only, checked here.
 *
 * Stock also changes on its own: an order takes it down, a cancellation puts it back. So a
 * stock is only written if it still holds the number the form loaded. If an order came in
 * while the admin was typing, nothing is saved and they are asked to look at the new number,
 * instead of their figure silently wiping out the sale (a "lost update").
 *
 * Afterwards every store page is rebuilt on its next visit, so shoppers see the new price.
 */
export async function updateProduct(update: ProductUpdate): Promise<ProductResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Only an admin can change a product." };
  const parsed = input.safeParse(update);
  if (!parsed.success) return { ok: false, error: "Some of the values are not valid." };
  const { data } = parsed;
  const problem = wasPriceProblem(data.priceCents, data.wasPriceCents);
  if (problem) return { ok: false, error: problem };

  try {
    await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: data.productId },
        select: { id: true, variants: { select: { key: true, name: true } } },
      });
      if (!product) throw new StockChanged("This product no longer exists.");

      await tx.product.update({
        where: { id: product.id },
        data: { priceCents: data.priceCents, originalPriceCents: data.wasPriceCents },
      });
      // Every shade sells at the product's price.
      await tx.variant.updateMany({
        where: { productId: product.id },
        data: { priceCents: data.priceCents },
      });

      if (data.stock && !product.variants.length) {
        const { count } = await tx.product.updateMany({
          where: { id: product.id, stock: data.stock.expected },
          data: { stock: data.stock.value },
        });
        if (!count) throw new StockChanged("The stock changed while you were editing.");
      }
      for (const shade of data.shades) {
        const name = product.variants.find((variant) => variant.key === shade.key)?.name;
        if (!name) throw new StockChanged("A shade no longer exists.");
        const { count } = await tx.variant.updateMany({
          where: { productId: product.id, key: shade.key, stock: shade.expected },
          data: { stock: shade.value },
        });
        if (!count) throw new StockChanged(`${name}’s stock changed while you were editing.`);
      }
    });
  } catch (error) {
    if (error instanceof StockChanged) {
      return {
        ok: false,
        error: `${error.message} An order may have come in. Nothing was saved: reload to see the new numbers.`,
      };
    }
    throw error;
  }

  // The store's pages are built ahead of time; this rebuilds them all on their next visit.
  revalidatePath("/", "layout");
  return { ok: true };
}
