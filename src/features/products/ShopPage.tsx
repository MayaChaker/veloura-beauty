"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Close, Tune } from "@mui/icons-material";
import { SUBCATEGORIES } from "../../data/subcategories";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCatalogue } from "../../hooks/useCatalogue";
import Breadcrumb, { type Crumb } from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import FiltersSidebar, { type FilterGroup } from "../../components/ui/FiltersSidebar";
import Pagination from "../../components/ui/Pagination";
import ProductGrid, { ProductGridItem } from "../../components/ui/ProductGrid";
import type { Category } from "../../types/commerce";
import ProductCard from "./ProductCard";
import {
  CATEGORIES,
  PAGE_SIZE,
  PRICE_BANDS,
  SORT_OPTIONS,
  facetCounts,
  filterAndSortProducts,
  pageCount,
} from "./shopLogic";
import { useShopFilters } from "./useShopFilters";
import styles from "./ShopPage.module.css";

const CATEGORY_LABELS: Record<string, { label: string; category: Category }> = {
  makeup: { label: "Makeup", category: "Makeup" },
  skincare: { label: "Skincare", category: "Skincare" },
  fragrance: { label: "Fragrance", category: "Fragrance" },
  hair: { label: "Haircare", category: "Hair" },
};

const plural = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

interface ShopPageProps {
  /** Category segment from /shop/[category]. */
  category?: string;
  /** Brand slug from /brands/[slug]. */
  brandSlug?: string;
  /** The /search results page. */
  search?: boolean;
}

/**
 * The listing with the filters in the URL. Pages render it inside a Suspense boundary whose
 * fallback is <ShopView> with no filters, so the default listing is in the HTML built ahead
 * of time, for search engines and for shoppers before the JavaScript has loaded.
 */
export default function ShopPage(props: ShopPageProps) {
  return <ShopView {...props} params={useSearchParams()} />;
}

interface NavLink {
  label: string;
  href: string;
  count: number;
  current: boolean;
}

/**
 * Every product listing: the shop, a category, a brand and search results. A short
 * header, then a quiet sidebar (the category's types as links, filters as closed
 * accordions) beside a three-column grid. On phones the sidebar opens in a drawer.
 * Filters live in the URL.
 */
const NO_FILTERS = new URLSearchParams();

export function ShopView({
  category,
  brandSlug,
  search = false,
  params = NO_FILTERS,
}: ShopPageProps & { params?: URLSearchParams }) {
  const { products: catalogue, getBrand } = useCatalogue();
  const { openCart } = useCartDrawer();
  const brand = brandSlug ? getBrand(brandSlug) : undefined;
  const shop = useShopFilters({ category, brand: brand?.name }, params);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { filters } = shop;

  const products = filterAndSortProducts(catalogue, filters);
  const counts = facetCounts(catalogue, filters);
  const pages = pageCount(products.length);
  const page = Math.min(shop.page, pages);
  const first = (page - 1) * PAGE_SIZE;
  const visible = products.slice(first, first + PAGE_SIZE);

  const current = category ? CATEGORY_LABELS[category] : undefined;
  const inCategory = current
    ? catalogue.filter((product) => product.category === current.category)
    : [];

  // The sidebar's first block: a category's types, or the categories on the whole shop.
  const navLinks: NavLink[] = current
    ? [
        {
          label: `All ${current.label.toLowerCase()}`,
          href: shop.hrefForSub(),
          count: inCategory.length,
          current: !filters.subcategory,
        },
        ...SUBCATEGORIES[current.category]
          .map((sub) => ({
            label: sub.label,
            href: shop.hrefForSub(sub.slug),
            count: inCategory.filter((product) => product.subcategory === sub.slug).length,
            current: filters.subcategory === sub.slug,
          }))
          .filter((link) => link.count > 0),
      ]
    : !brand && !search
      ? [
          {
            label: "All products",
            href: "/shop",
            count: catalogue.length,
            current: !filters.collection,
          },
          ...CATEGORIES.map((segment) => ({
            label: CATEGORY_LABELS[segment]?.label ?? segment,
            href: `/shop/${segment}`,
            count: catalogue.filter(
              (product) => product.category === CATEGORY_LABELS[segment]?.category,
            ).length,
            current: false,
          })),
        ]
      : [];

  const title = brand
    ? brand.name
    : search
      ? filters.query
        ? `Results for “${filters.query}”`
        : "Search"
      : filters.collection === "new"
        ? "New in"
        : filters.collection === "bestsellers"
          ? "Bestsellers"
          : (current?.label ?? "All products");

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }];
  if (brand) crumbs.push({ label: "Brands", href: "/brands" }, { label: brand.name });
  else if (search) crumbs.push({ label: "Search" });
  else {
    crumbs.push({ label: "Shop", href: "/shop" });
    if (current) crumbs.push({ label: current.label, href: `/shop/${category}` });
    const sub = navLinks.find((link) => link.current && filters.subcategory);
    if (sub) crumbs.push({ label: sub.label });
  }

  const groups: FilterGroup[] = [
    ...(!brand
      ? [
          {
            id: "brand",
            legend: "Brand",
            multiple: true,
            selected: filters.brands,
            onChange: shop.setBrands,
            options: counts.brands.map(([name, count]) => ({ value: name, label: name, count })),
          },
        ]
      : []),
    {
      id: "price",
      legend: "Price",
      multiple: true,
      selected: filters.prices,
      onChange: shop.setPrices,
      options: counts.prices.map(([slug, count]) => ({
        value: slug,
        label: PRICE_BANDS.find((band) => band.slug === slug)?.label ?? slug,
        count,
      })),
    },
    {
      id: "stock",
      legend: "Availability",
      multiple: true,
      selected: filters.inStock ? ["in"] : [],
      onChange: (values: string[]) => shop.setInStock(values.includes("in")),
      options: [{ value: "in", label: "In stock", count: counts.inStock }],
    },
  ];

  const chips = [
    ...filters.brands.map((name) => ({
      label: name,
      remove: () => shop.setBrands(filters.brands.filter((value) => value !== name)),
    })),
    ...filters.prices.map((slug) => ({
      label: PRICE_BANDS.find((band) => band.slug === slug)?.label ?? slug,
      remove: () => shop.setPrices(filters.prices.filter((value) => value !== slug)),
    })),
    ...(filters.inStock ? [{ label: "In stock", remove: () => shop.setInStock(false) }] : []),
  ];

  const sidebar = (
    <FiltersSidebar
      groups={groups}
      onClear={shop.clearFilters}
      intro={
        navLinks.length > 0 && (
          <nav className={styles.types} aria-label="Category">
            <p className="text-label text-muted">Category</p>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={link.current ? "page" : undefined}
                    onClick={() => setFiltersOpen(false)}
                  >
                    {link.label}
                    <span>{link.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )
      }
    />
  );

  const sort = (
    <label className={styles.sort}>
      <span>Sort by</span>
      <select value={filters.sort} onChange={(event) => shop.setSort(event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <Breadcrumb items={crumbs} />
        <div className={styles.titleRow}>
          <div>
            {brand && <p className="text-label text-muted">Brand</p>}
            <h1>{title}</h1>
          </div>
          <p className="text-label text-muted" aria-live="polite">
            {plural(products.length)}
          </p>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Filters">
          {sidebar}
        </aside>

        <div className={styles.results}>
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.filterButton}
              onClick={() => setFiltersOpen(true)}
            >
              <Tune aria-hidden="true" />
              Filters{shop.filterCount > 0 && ` (${shop.filterCount})`}
            </button>
            {products.length > 0 && (
              <p className={styles.showing}>
                Showing{" "}
                <strong>
                  {first + 1}–{first + visible.length}
                </strong>{" "}
                of {products.length}
              </p>
            )}
            {sort}
          </div>

          {chips.length > 0 && (
            <ul className={styles.chips} aria-label="Filters in use">
              {chips.map((chip) => (
                <li key={chip.label}>
                  <button type="button" onClick={chip.remove} aria-label={`Remove ${chip.label}`}>
                    {chip.label}
                    <Close aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {visible.length ? (
            <>
              {/* Product names are h3: this keeps the outline h1 → h2 → h3 for screen readers. */}
              <h2 className="srOnly">Products</h2>
              <ProductGrid maxColumns={3}>
                {visible.map((product, index) => (
                  <ProductGridItem key={product.id}>
                    <ProductCard product={product} onAdded={openCart} priority={index < 3} />
                  </ProductGridItem>
                ))}
              </ProductGrid>
              <div className={styles.pagination}>
                <Pagination page={page} pageCount={pages} hrefFor={shop.hrefForPage} />
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <h2 className="text-h3">
                {filters.query ? `Nothing found for “${filters.query}”` : "No products match"}
              </h2>
              <p className="text-muted">
                Try another search, or remove a filter to see more products.
              </p>
              <div className={styles.emptyActions}>
                {shop.filterCount > 0 && (
                  <Button variant="secondary" onClick={shop.clearFilters}>
                    Clear filters
                  </Button>
                )}
                <Button href="/shop">View all products</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        footer={
          <Button fullWidth onClick={() => setFiltersOpen(false)}>
            Show {plural(products.length)}
          </Button>
        }
      >
        {sidebar}
      </Drawer>
    </main>
  );
}
