"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { OUT_OF_STOCK_IDS } from "../../data/merchandising";
import { reviewsFor } from "../../data/reviews";
import { resolveProductSelection } from "../../domain/product/productSelection";
import { useCatalogue } from "../../hooks/useCatalogue";
import { useCommerce } from "../../hooks/useCommerce";
import ProductVisual from "../../components/product-art/ProductVisual";
import Badge, { isBadgeKind, type BadgeKind } from "../../components/ui/Badge";
import Price from "../../components/ui/Price";
import Rating from "../../components/ui/Rating";
import type { Product } from "../../types/commerce";
import WishlistButton from "../wishlist/WishlistButton";
import ShadeSwatches from "./ShadeSwatches";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: Product;
  /** Called after the product is added to the bag, e.g. to open the bag drawer. */
  onAdded?: () => void;
  /** Load the photograph eagerly: only for cards above the fold. */
  priority?: boolean;
}

const SIZES = "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw";

/** One label per card, the strongest first. */
export const badgeFor = (product: Product): BadgeKind | undefined => {
  if (product.badge === "Exclusive") return "Exclusive";
  if (product.isNew) return "New";
  if (product.isBestseller || product.badge === "Bestseller") return "Bestseller";
  return isBadgeKind(product.badge) ? product.badge : undefined;
};

export default function ProductCard({ product, onAdded, priority = false }: ProductCardProps) {
  const catalogue = useCatalogue();
  const { addToCart } = useCommerce();
  const [selectedId, setSelectedId] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const resetTimerRef = useRef<number | undefined>(undefined);
  const selected = product.variants?.find((variant) => variant.id === selectedId);
  const display = resolveProductSelection(catalogue, product, selected?.id) ?? product;
  const outOfStock = OUT_OF_STOCK_IDS.includes(product.id) || selected?.stock === 0;
  const needsShade = Boolean(product.variants && !selected);
  const productHref = `/product/${product.slug}${selected ? `?variant=${selected.id}` : ""}`;
  const shadeLabel = selected ? ` in ${selected.name}` : "";
  const badge = badgeFor(product);
  // The hover photograph exists only when the product has a second image.
  const hoverImage = !selected ? product.gallery?.[0] : undefined;

  useEffect(() => () => window.clearTimeout(resetTimerRef.current), []);

  const add = () => {
    if (outOfStock || needsShade) return;
    addToCart(display);
    onAdded?.();
    // Confirm on the button itself, then return to the normal label.
    setJustAdded(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setJustAdded(false), 1600);
  };

  // A shaded product without a chosen shade leads to its page, where every shade is shown.
  const action =
    needsShade && !outOfStock ? (
      <Link href={productHref} className={styles.action}>
        Choose shade
      </Link>
    ) : (
      <button type="button" className={styles.action} disabled={outOfStock} onClick={add}>
        {outOfStock ? "Out of stock" : justAdded ? "Added" : "Add to bag"}
      </button>
    );

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Link
          href={productHref}
          className={`${styles.imageLink} ${hoverImage ? styles.hasHover : ""}`}
          aria-label={`View ${product.name}${shadeLabel}`}
        >
          <ProductVisual product={display} sizes={SIZES} priority={priority} />
          {hoverImage && (
            <Image
              className={styles.hoverImage}
              src={hoverImage}
              alt=""
              fill
              sizes={SIZES}
              quality={90}
            />
          )}
        </Link>
        {badge && (
          <span className={styles.badge}>
            <Badge kind={badge} />
          </span>
        )}
        <WishlistButton
          className={styles.wishlist}
          productId={product.id}
          productName={product.name}
        />
        {action}
      </div>

      <div className={styles.body}>
        <p className="text-label">{product.brand}</p>
        <h3 className={styles.name}>
          <Link href={productHref}>{product.name}</Link>
        </h3>
        <Rating reviews={reviewsFor(product.id)} />
        <div className={styles.meta}>
          <Price amount={display.price} compareAt={product.originalPrice} />
          <span className="text-caption text-muted">
            {product.variants
              ? (selected?.name ?? `${product.variants.length} shades`)
              : product.size}
          </span>
        </div>
        {product.variants && (
          <ShadeSwatches
            productName={product.name}
            variants={product.variants}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>
      <span className="srOnly" aria-live="polite">
        {justAdded ? `${product.name}${shadeLabel} added to bag` : ""}
      </span>
    </article>
  );
}
