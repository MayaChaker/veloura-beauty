import "server-only";
import { cache } from "react";
import { PRODUCTS } from "../data/products";
import { createCatalogue, type Catalogue } from "../domain/catalogue/catalogue";

/**
 * The catalogue for server code. Wrapped in React's cache(), so a page that asks for it from
 * several components builds it once per request.
 */
export const getCatalogue = cache(async (): Promise<Catalogue> => createCatalogue(PRODUCTS));
