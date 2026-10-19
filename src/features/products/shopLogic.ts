import { OUT_OF_STOCK_IDS } from "../../data/merchandising";
import type { Product } from "../../types/commerce";

/** URL segments accepted by /shop/[category]. */
export const CATEGORIES = ["makeup", "skincare", "fragrance", "hair"];

export type SortOption = "featured" | "price-low" | "price-high" | "newest";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
];

/** Price ranges offered as filters; a product matches when min <= price < max. */
export const PRICE_BANDS = [
  { slug: "under-25", label: "Under $25", min: 0, max: 25 },
  { slug: "25-50", label: "$25 – $50", min: 25, max: 50 },
  { slug: "50-100", label: "$50 – $100", min: 50, max: 100 },
  { slug: "100-plus", label: "$100 and over", min: 100, max: Infinity },
] as const;

export const PAGE_SIZE = 12;

/** Shop filters as read from the URL. Unknown sort values fall back to "featured". */
export interface ShopFilters {
  /** Category segment, e.g. "makeup"; fixed by the route. */
  category?: string;
  /** Brand name; fixed on a brand page. */
  brand?: string;
  /** Subcategory slug, e.g. "lips"; only meaningful with a category. */
  subcategory?: string;
  /** "new" or "bestsellers". */
  collection: string;
  query: string;
  /** Brand names chosen in the filters. */
  brands: string[];
  /** Price band slugs chosen in the filters. */
  prices: string[];
  inStock: boolean;
  sort: SortOption | (string & {});
}

export const EMPTY_FILTERS: ShopFilters = {
  collection: "",
  query: "",
  brands: [],
  prices: [],
  inStock: false,
  sort: "featured",
};

export const isProductAvailable = (product: Product): boolean =>
  !OUT_OF_STOCK_IDS.includes(product.id) &&
  (!product.variants || product.variants.some((variant) => (variant.stock ?? 0) > 0));

export const searchableProductText = (product: Product): string =>
  [
    product.name,
    product.brand,
    product.category,
    product.type,
    product.note,
    product.description,
    product.size,
    ...(product.matches || []),
    ...(product.benefits || []),
    ...(product.variants || []).map((variant) => variant.name),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const inPriceBand = (price: number, slug: string) => {
  const band = PRICE_BANDS.find((item) => item.slug === slug);
  return Boolean(band && price >= band.min && price < band.max);
};

/** Every test a product must pass; a facet's own test can be skipped to count its options. */
const tests = (filters: ShopFilters) => {
  const query = filters.query.trim().toLowerCase();
  return {
    scope: (product: Product) =>
      (!filters.category || product.category.toLowerCase() === filters.category.toLowerCase()) &&
      (!filters.brand || product.brand === filters.brand) &&
      (!filters.subcategory || product.subcategory === filters.subcategory) &&
      (filters.collection !== "new" || Boolean(product.isNew)) &&
      (filters.collection !== "bestsellers" || Boolean(product.isBestseller)) &&
      (!query || searchableProductText(product).includes(query)),
    brands: (product: Product) => !filters.brands.length || filters.brands.includes(product.brand),
    prices: (product: Product) =>
      !filters.prices.length || filters.prices.some((slug) => inPriceBand(product.price, slug)),
    stock: (product: Product) => !filters.inStock || isProductAvailable(product),
  };
};

type FacetKey = "brands" | "prices" | "stock";

/** Products passing every filter except `skip`, used to count a facet's options honestly. */
const matching = (products: readonly Product[], filters: ShopFilters, skip?: FacetKey) => {
  const checks = tests(filters);
  return products.filter(
    (product) =>
      checks.scope(product) &&
      (skip === "brands" || checks.brands(product)) &&
      (skip === "prices" || checks.prices(product)) &&
      (skip === "stock" || checks.stock(product)),
  );
};

export function filterAndSortProducts(
  products: readonly Product[],
  filters: ShopFilters,
): Product[] {
  return [...matching(products, filters)].sort((a, b) => {
    if (filters.sort === "price-low") return a.price - b.price;
    if (filters.sort === "price-high") return b.price - a.price;
    if (filters.sort === "newest") return Number(b.isNew) - Number(a.isNew) || b.id - a.id;
    return Number(b.isBestseller) - Number(a.isBestseller) || a.id - b.id;
  });
}

export interface FacetCounts {
  brands: [string, number][];
  prices: [string, number][];
  inStock: number;
}

/**
 * How many products each filter option would show, given the other filters in use.
 * Options with no products are left for the sidebar to hide.
 */
export function facetCounts(products: readonly Product[], filters: ShopFilters): FacetCounts {
  const forBrands = matching(products, filters, "brands");
  const forPrices = matching(products, filters, "prices");
  const brandCounts = forBrands.reduce<Record<string, number>>((counts, product) => {
    counts[product.brand] = (counts[product.brand] ?? 0) + 1;
    return counts;
  }, {});
  return {
    brands: Object.entries(brandCounts).sort(([a], [b]) => a.localeCompare(b)),
    prices: PRICE_BANDS.map((band) => [
      band.slug,
      forPrices.filter((product) => inPriceBand(product.price, band.slug)).length,
    ]),
    inStock: matching(products, filters, "stock").filter(isProductAvailable).length,
  };
}

export const pageCount = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));
