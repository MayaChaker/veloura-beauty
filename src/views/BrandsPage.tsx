import Breadcrumb from "../components/ui/Breadcrumb";
import type { Catalogue } from "../domain/catalogue/catalogue";
import { getCatalogue } from "../server/catalogue";
import type { Category } from "../types/commerce";
import BrandDirectory, { type BrandEntry } from "./BrandDirectory";
import styles from "./BrandsPage.module.css";

const CATEGORY_LABEL: Partial<Record<Category, string>> = { Hair: "Haircare" };
const FEATURED_COUNT = 6;

/** Every brand with the categories Veloura carries from it and one of its products to picture it. */
const entriesFor = (catalogue: Catalogue): BrandEntry[] =>
  catalogue.brands.map((brand) => {
    const products = catalogue.products.filter((product) => product.brand === brand.name);
    return {
      ...brand,
      categories: [
        ...new Set(products.map((product) => CATEGORY_LABEL[product.category] ?? product.category)),
      ],
      product: products.find((product) => product.isBestseller) ?? products[0],
    };
  });

/** The brands with the widest selection, shown with a photograph above the full list. */
const featuredOf = (entries: BrandEntry[]) =>
  [...entries]
    .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name))
    .slice(0, FEATURED_COUNT);

export default async function BrandsPage() {
  const entries = entriesFor(await getCatalogue());
  return (
    <main className={styles.page}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
      <BrandDirectory brands={entries} featured={featuredOf(entries)} />
    </main>
  );
}
