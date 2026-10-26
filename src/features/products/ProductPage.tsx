"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OUT_OF_STOCK_IDS } from "../../data/merchandising";
import { MENU } from "../../data/navigation";
import { DEFAULT_STOCK } from "../../domain/commerce/commerceConfig";
import { SUBCATEGORIES } from "../../data/subcategories";
import { resolveProductSelection } from "../../domain/product/productSelection";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCatalogue } from "../../hooks/useCatalogue";
import { useCommerce } from "../../hooks/useCommerce";
import { useCustomer } from "../../hooks/useCustomer";
import Breadcrumb, { type Crumb } from "../../components/ui/Breadcrumb";
import type { Catalogue } from "../../domain/catalogue/catalogue";
import type { Product } from "../../types/commerce";
import NotFoundPage from "../../views/NotFoundPage";
import ProductGallery from "./ProductGallery";
import ProductPurchase from "./ProductPurchase";
import ProductShelf from "./ProductShelf";
import styles from "./ProductPage.module.css";

/** Products from the same category or sharing a concern, closest first. */
const pairsFor = (catalogue: Catalogue, product: Product) =>
  catalogue.products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.category === product.category ||
          product.matches.some((match) => item.matches.includes(match))),
    )
    .sort(
      (a, b) => Number(b.category === product.category) - Number(a.category === product.category),
    )
    .slice(0, 4);

const crumbsFor = (product: Product): Crumb[] => {
  const section = MENU.find((item) => item.category === product.category);
  const sub = SUBCATEGORIES[product.category].find((item) => item.slug === product.subcategory);
  return [
    { label: "Home", href: "/" },
    ...(section?.href ? [{ label: section.label, href: section.href }] : []),
    ...(section?.href && sub
      ? [{ label: sub.label, href: `${section.href}?sub=${sub.slug}` }]
      : []),
    { label: product.name },
  ];
};

/**
 * The product with the shade named in the URL (?variant=deep). Its page renders it inside a
 * Suspense boundary whose fallback is <ProductView> with the first shade, so the product is in
 * the HTML built ahead of time, for search engines and link previews.
 */
export default function ProductPage({ slug }: { slug: string }) {
  return <ProductView slug={slug} variantId={useSearchParams().get("variant")} />;
}

export function ProductView({
  slug,
  variantId = null,
}: {
  slug: string;
  variantId?: string | null;
}) {
  const catalogue = useCatalogue();
  const router = useRouter();
  const pathname = usePathname();
  const { openCart } = useCartDrawer();
  const { addToCart } = useCommerce();
  const { addRecentlyViewed, recentlyViewed } = useCustomer();
  const product = catalogue.getBySlug(slug);
  const productId = product?.id;

  useEffect(() => {
    if (productId) addRecentlyViewed(productId);
  }, [productId, addRecentlyViewed]);

  if (!product) return <NotFoundPage />;

  // The chosen shade lives in the URL (?variant=deep), so it can be linked to directly.
  const shade =
    product.variants?.find((variant) => variant.id === variantId) ?? product.variants?.[0];
  const display = resolveProductSelection(catalogue, product, shade?.id) ?? product;
  const stock = OUT_OF_STOCK_IDS.includes(product.id)
    ? 0
    : (shade?.stock ?? product.stock ?? DEFAULT_STOCK);
  const recent = catalogue
    .getManyByIds(recentlyViewed.filter((id) => id !== product.id))
    .slice(0, 4);

  const selectShade = (variantId: string) =>
    router.replace(`${pathname}?variant=${encodeURIComponent(variantId)}`, { scroll: false });
  const add = (quantity: number) => {
    addToCart(display, quantity);
    openCart();
  };

  return (
    <main className={styles.page}>
      <Breadcrumb items={crumbsFor(product)} />
      <section className={styles.product}>
        <ProductGallery product={product} display={display} shade={shade} />
        <ProductPurchase
          product={product}
          shade={shade}
          price={display.price}
          stock={stock}
          onSelectShade={selectShade}
          onAdd={add}
        />
      </section>

      <section className={styles.howTo} aria-labelledby="how-to-use">
        <div>
          <p className="text-label text-muted">How to use</p>
          <h2 id="how-to-use">
            Use it <em>well</em>
          </h2>
        </div>
        <dl className={styles.howToList}>
          <div>
            <dt>Apply</dt>
            <dd>{product.ritual}</dd>
          </div>
          <div>
            <dt>In your routine</dt>
            <dd>{product.order}</dd>
          </div>
          <div>
            <dt>Texture</dt>
            <dd>
              {product.texture}, {product.finish.toLowerCase()} finish
            </dd>
          </div>
        </dl>
      </section>

      <div className={styles.shelves}>
        <ProductShelf
          title="Pairs well with"
          eyebrow="Complete the look"
          products={pairsFor(catalogue, product)}
          openCart={openCart}
        />
        <ProductShelf title="Recently viewed" products={recent} openCart={openCart} />
      </div>
    </main>
  );
}
