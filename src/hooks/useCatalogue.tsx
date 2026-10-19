"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createCatalogue, type Catalogue } from "../domain/catalogue/catalogue";
import type { Product } from "../types/commerce";

const CatalogueContext = createContext<Catalogue | null>(null);

/** Makes the products the server loaded available to client components. */
export function CatalogueProvider({
  products,
  children,
}: {
  products: readonly Product[];
  children: ReactNode;
}) {
  const catalogue = useMemo(() => createCatalogue(products), [products]);
  return <CatalogueContext.Provider value={catalogue}>{children}</CatalogueContext.Provider>;
}

export const useCatalogue = (): Catalogue => {
  const value = useContext(CatalogueContext);
  if (!value) throw new Error("useCatalogue must be used inside CatalogueProvider");
  return value;
};
