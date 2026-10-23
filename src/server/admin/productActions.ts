"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { MAX_PRICE_CENTS, MAX_STOCK, wasPriceProblem } from "../../domain/admin/products";
import { getAdmin } from "../session";
import { saveProduct, type ProductResult, type ProductUpdate } from "./productUpdate";

export type { ProductResult, ProductUpdate };

const cents = z.number().int().min(1).max(MAX_PRICE_CENTS);
const stockChange = z.object({
  expected: z.number().int().min(0),
  value: z.number().int().min(0).max(MAX_STOCK),
});

const input = z.object({
  productId: z.number().int().positive(),
  priceCents: cents,
  wasPriceCents: cents.nullable(),
  stock: stockChange.nullable(),
  shades: z.array(stockChange.extend({ key: z.string().min(1).max(64) })).max(100),
}) satisfies z.ZodType<ProductUpdate>;

/**
 * Saves a product's price, was price and stock. Admins only, checked here, with every value
 * validated. The transaction and the lost-update check are in productUpdate.ts.
 * Afterwards every store page is rebuilt on its next visit, so shoppers see the new price.
 */
export async function updateProduct(update: ProductUpdate): Promise<ProductResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "Only an admin can change a product." };
  const parsed = input.safeParse(update);
  if (!parsed.success) return { ok: false, error: "Some of the values are not valid." };
  const problem = wasPriceProblem(parsed.data.priceCents, parsed.data.wasPriceCents);
  if (problem) return { ok: false, error: problem };

  const result = await saveProduct(parsed.data);
  // The store's pages are built ahead of time; this rebuilds them all on their next visit.
  if (result.ok) revalidatePath("/", "layout");
  return result;
}
