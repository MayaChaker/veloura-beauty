import type { MetadataRoute } from "next";
import { CATEGORIES } from "../features/products/shopLogic";
import { POLICIES } from "../data/policies";
import { getCatalogue } from "../server/catalogue";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { brands, products } = await getCatalogue();
  const paths = [
    "/",
    "/shop",
    ...CATEGORIES.map((category) => `/shop/${category}`),
    "/brands",
    ...brands.map((brand) => `/brands/${brand.slug}`),
    ...products.map((product) => `/product/${product.slug}`),
    ...Object.keys(POLICIES).map((policy) => `/care/${policy}`),
  ];
  return paths.map((path) => ({ url: `${SITE}${path}` }));
}
