import { usePathname, useRouter } from "next/navigation";
import type { ShopFilters } from "./shopLogic";

/** Query parameters cleared by "Clear all"; search, collection and subcategory stay. */
const FILTER_KEYS = ["brand", "price", "stock", "page"];

const list = (value: string | null) => (value ? value.split(",").filter(Boolean) : []);

const withQuery = (path: string, next: URLSearchParams) => {
  const search = next.toString();
  return search ? `${path}?${search}` : path;
};

interface Scope {
  /** Category segment from /shop/[category]. */
  category?: string;
  /** Brand name on a brand page. */
  brand?: string;
}

/**
 * Shop filters stored in the URL, so results survive a refresh and can be shared.
 * Filter changes replace the URL in place and return to the first page. `params` is the
 * page's query string, passed in so that the page can also be rendered without one.
 */
export function useShopFilters({ category, brand }: Scope, params: URLSearchParams) {
  const router = useRouter();
  const pathname = usePathname();
  const page = Math.max(1, Number(params.get("page")) || 1);

  const filters: ShopFilters = {
    category,
    brand,
    subcategory: params.get("sub") || undefined,
    collection: params.get("collection") || "",
    query: params.get("q") || params.get("search") || "",
    brands: list(params.get("brand")),
    prices: list(params.get("price")),
    inStock: params.get("stock") === "in",
    sort: params.get("sort") || "featured",
  };

  const update = (change: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    change(next);
    next.delete("page");
    router.replace(withQuery(pathname, next), { scroll: false });
  };
  const setList = (key: string, values: string[]) =>
    update((next) => (values.length ? next.set(key, values.join(",")) : next.delete(key)));

  /** The URL of another page of the same results. */
  const hrefForPage = (target: number) => {
    const next = new URLSearchParams(params);
    if (target > 1) next.set("page", String(target));
    else next.delete("page");
    return withQuery(pathname, next);
  };

  /** The URL of a subcategory tab, keeping the shopper's filters. */
  const hrefForSub = (slug?: string) => {
    const next = new URLSearchParams(params);
    next.delete("page");
    if (slug) next.set("sub", slug);
    else next.delete("sub");
    return withQuery(pathname, next);
  };

  return {
    filters,
    page,
    /** Number of sidebar filters in use. */
    filterCount: filters.brands.length + filters.prices.length + Number(filters.inStock),
    setBrands: (values: string[]) => setList("brand", values),
    setPrices: (values: string[]) => setList("price", values),
    setInStock: (enabled: boolean) =>
      update((next) => (enabled ? next.set("stock", "in") : next.delete("stock"))),
    setSort: (value: string) =>
      update((next) => (value === "featured" ? next.delete("sort") : next.set("sort", value))),
    clearFilters: () => update((next) => FILTER_KEYS.forEach((key) => next.delete(key))),
    /** Opens a category, keeping the shopper's filters and search. */
    goToCategory: (segment: string) => {
      const next = new URLSearchParams(params);
      next.delete("sub");
      next.delete("page");
      router.push(withQuery(segment ? `/shop/${segment}` : "/shop", next));
    },
    hrefForPage,
    hrefForSub,
  };
}
