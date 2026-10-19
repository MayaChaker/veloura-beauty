import { brandHref, type Catalogue } from "../domain/catalogue/catalogue";
import type { Category } from "../types/commerce";
import { SUBCATEGORIES } from "./subcategories";

export interface MenuLink {
  label: string;
  href: string;
}

export interface MenuColumn {
  title: string;
  links: (MenuLink & { count?: number })[];
}

export interface MenuItem {
  label: string;
  /** Omitted for an item that only opens its panel. */
  href?: string;
  /** Off until the section has products; turning it on is a one-word change. */
  enabled: boolean;
  /** Catalogue category whose subcategories and brands fill the mega-menu panel. */
  category?: Category;
  /** The Brands item opens a panel listing every brand. */
  brands?: boolean;
  /** Campaign photograph shown in the panel, from public/images/campaign. */
  image?: string;
  /** Extra links in the panel's "Discover" column, e.g. a tool for that category. */
  discover?: MenuLink[];
}

/** The main menu, in order. Body, Tools and Sale wait for products. */
export const MENU: readonly MenuItem[] = [
  {
    label: "Makeup",
    href: "/shop/makeup",
    category: "Makeup",
    image: "makeup",
    enabled: true,
  },
  {
    label: "Skincare",
    href: "/shop/skincare",
    category: "Skincare",
    image: "skincare",
    enabled: true,
  },
  {
    label: "Fragrance",
    href: "/shop/fragrance",
    category: "Fragrance",
    image: "fragrance",
    enabled: true,
  },
  { label: "Haircare", href: "/shop/hair", category: "Hair", image: "hair", enabled: true },
  { label: "Body", href: "/shop/body", enabled: false },
  { label: "Tools", href: "/shop/tools", enabled: false },
  { label: "Brands", href: "/brands", brands: true, enabled: true },
  { label: "New in", href: "/shop?collection=new", enabled: true },
  { label: "Sale", href: "/shop?collection=sale", enabled: false },
];

export const NAVIGATION: readonly MenuItem[] = MENU.filter((item) => item.enabled);

const MAX_BRANDS = 6;

const byCount = ([a, countA]: [string, number], [b, countB]: [string, number]) =>
  countB - countA || a.localeCompare(b);

/** The columns of an item's mega-menu panel, built from the catalogue; empty for plain links. */
export function menuColumns(item: MenuItem, catalogue: Catalogue): MenuColumn[] {
  if (item.brands) {
    // Every brand, A to Z, split into three columns.
    const links = [
      { label: "All brands A–Z", href: "/brands" },
      ...catalogue.brands.map((brand) => ({ label: brand.name, href: brandHref(brand.name) })),
    ];
    const size = Math.ceil(links.length / 3);
    return [0, 1, 2].map((index) => ({
      title: index === 0 ? "Brands" : "",
      links: links.slice(index * size, (index + 1) * size),
    }));
  }
  if (!item.category || !item.href) return [];

  const inCategory = catalogue.products.filter((product) => product.category === item.category);
  const types = SUBCATEGORIES[item.category]
    .map((sub) => ({
      label: sub.label,
      href: `${item.href}?sub=${sub.slug}`,
      count: inCategory.filter((product) => product.subcategory === sub.slug).length,
    }))
    .filter((sub) => sub.count > 0);
  const brandCounts = inCategory.reduce<Record<string, number>>((counts, product) => {
    counts[product.brand] = (counts[product.brand] ?? 0) + 1;
    return counts;
  }, {});
  const brands = Object.entries(brandCounts)
    .sort(byCount)
    .slice(0, MAX_BRANDS)
    .map(([name]) => ({ label: name, href: brandHref(name) }));
  const discover = [
    ...(item.discover ?? []),
    ...(inCategory.some((product) => product.isBestseller)
      ? [{ label: "Bestsellers", href: `${item.href}?collection=bestsellers` }]
      : []),
    ...(inCategory.some((product) => product.isNew)
      ? [{ label: "New in", href: `${item.href}?collection=new` }]
      : []),
  ];

  return [
    {
      title: "Shop by type",
      links: [
        { label: `All ${item.label.toLowerCase()}`, href: item.href, count: inCategory.length },
        ...types,
      ],
    },
    { title: "Brands", links: brands },
    ...(discover.length ? [{ title: "Discover", links: discover }] : []),
  ];
}
