import type { Product, ProductId, SingleProduct } from "../../types/commerce";

export interface Brand {
  slug: string;
  name: string;
  productCount: number;
}

/** "Estée Lauder" → "estee-lauder". */
export const brandSlug = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** A brand's page, from its name. */
export const brandHref = (name: string): string => `/brands/${brandSlug(name)}`;

const byName = (a: Brand, b: Brand) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });

/**
 * Every read of the products and brands goes through one Catalogue, so the code does not
 * care where they come from. Server code gets it from getCatalogue(); client components
 * from useCatalogue().
 */
export interface Catalogue {
  products: readonly Product[];
  /** Every brand A to Z, with how many of its products Veloura carries. */
  brands: readonly Brand[];
  /** Accepts string ids too, because ids read back from storage or URLs may be strings. */
  getById: (id: ProductId | string | undefined) => Product | undefined;
  getBySlug: (slug: string) => Product | undefined;
  getManyByIds: (ids?: Array<ProductId | string>) => Product[];
  getBrand: (slug: string) => Brand | undefined;
}

export function createCatalogue(source: readonly Product[]): Catalogue {
  const byId = new Map(source.map((product) => [product.id, product]));
  // A set is drawn from the products inside it, so they are attached once here.
  const products = source.map(
    (product): Product =>
      product.type === "set"
        ? {
            ...product,
            parts: product.includes
              .map((id) => byId.get(id))
              .filter((part): part is SingleProduct => part !== undefined && part.type !== "set"),
          }
        : product,
  );
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const resolved = new Map(products.map((product) => [product.id, product]));

  const counts = new Map<string, Brand>();
  for (const product of products) {
    const slug = brandSlug(product.brand);
    const brand = counts.get(slug) ?? { slug, name: product.brand, productCount: 0 };
    counts.set(slug, { ...brand, productCount: brand.productCount + 1 });
  }
  const brands = [...counts.values()].sort(byName);
  const brandsBySlug = new Map(brands.map((brand) => [brand.slug, brand]));

  const getById = (id: ProductId | string | undefined) => resolved.get(Number(id));
  return {
    products,
    brands,
    getById,
    getBySlug: (slug) => bySlug.get(slug),
    getManyByIds: (ids = []) =>
      ids.map((id) => getById(id)).filter((product): product is Product => Boolean(product)),
    getBrand: (slug) => brandsBySlug.get(slug),
  };
}
