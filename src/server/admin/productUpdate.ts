import "server-only";
import { db } from "../../lib/db";

/** A stock change: what the form loaded, and what the admin typed. */
export interface StockChange {
  expected: number;
  value: number;
}

export interface ProductUpdate {
  productId: number;
  priceCents: number;
  wasPriceCents: number | null;
  /** For a product without shades. */
  stock: StockChange | null;
  /** For a product with shades, one per shade that changed. */
  shades: Array<StockChange & { key: string }>;
}

export type ProductResult = { ok: true } | { ok: false; error: string };

/** Thrown inside the transaction so that nothing is saved; turned into a message below. */
class StockChanged extends Error {}

/**
 * Saves a product's price, was price and stock, all or nothing. The caller has already checked
 * that the user is an admin and validated the values (see productActions.ts).
 *
 * Stock also changes on its own: an order takes it down, a cancellation puts it back. So a
 * stock is only written if it still holds the number the form loaded. If an order came in
 * while the admin was typing, nothing is saved and they are asked to look at the new number,
 * instead of their figure silently wiping out the sale (a "lost update").
 */
export async function saveProduct(update: ProductUpdate): Promise<ProductResult> {
  try {
    await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: update.productId },
        select: { id: true, variants: { select: { key: true, name: true } } },
      });
      if (!product) throw new StockChanged("This product no longer exists.");

      await tx.product.update({
        where: { id: product.id },
        data: { priceCents: update.priceCents, originalPriceCents: update.wasPriceCents },
      });
      // Every shade sells at the product's price.
      await tx.variant.updateMany({
        where: { productId: product.id },
        data: { priceCents: update.priceCents },
      });

      if (update.stock && !product.variants.length) {
        const { count } = await tx.product.updateMany({
          where: { id: product.id, stock: update.stock.expected },
          data: { stock: update.stock.value },
        });
        if (!count) throw new StockChanged("The stock changed while you were editing.");
      }
      for (const shade of update.shades) {
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
  return { ok: true };
}
