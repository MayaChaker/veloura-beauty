import "server-only";
import { cache } from "react";
import { createCatalogue, type Catalogue } from "../domain/catalogue/catalogue";
import { db } from "../lib/db";
import { toProduct } from "./productRecord";

/**
 * The catalogue for server code, read from the database: every product with its brand and
 * shades, in listing order. Pages are pre-rendered, so this runs while building, not on
 * every visit; React's cache() makes it run once per page render.
 */
export const getCatalogue = cache(async (): Promise<Catalogue> => {
  const records = await db.product.findMany({
    include: { brand: { select: { name: true } }, variants: { orderBy: { position: "asc" } } },
    orderBy: { position: "asc" },
  });
  return createCatalogue(records.map(toProduct));
});
