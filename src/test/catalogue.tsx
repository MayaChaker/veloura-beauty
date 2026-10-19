import type { ReactNode } from "react";
import { PRODUCTS } from "../data/products";
import { createCatalogue } from "../domain/catalogue/catalogue";
import AppProviders from "../providers/AppProviders";

/** The catalogue files, as the app would load them: tests read the same products as the seed. */
export const catalogue = createCatalogue(PRODUCTS);

/** Every provider the app mounts, with the test catalogue. */
export function TestProviders({ children }: { children: ReactNode }) {
  return <AppProviders products={catalogue.products}>{children}</AppProviders>;
}
