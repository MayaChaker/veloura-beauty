import Image from "next/image";
import ProductArt, { type ArtProduct } from "./ProductArt";
import styles from "./ProductVisual.module.css";

interface ProductVisualProps {
  product?: ArtProduct | null;
  /** Rendered width at each breakpoint, so the browser downloads the right size. */
  sizes: string;
  /** Load eagerly: only for the main image above the fold. */
  priority?: boolean;
  /** Hide from assistive tech when the product name is already next to the image. */
  decorative?: boolean;
}

/**
 * The product's photograph (the chosen shade's, for a selection), or the SVG art
 * when no photograph exists, e.g. for a product added before its shoot.
 */
export default function ProductVisual({
  product,
  sizes,
  priority = false,
  decorative = false,
}: ProductVisualProps) {
  if (!product) return null;
  if (!product.image) return <ProductArt product={product} decorative={decorative} />;
  const alt = decorative
    ? ""
    : `${product.name}${product.selectedVariant ? ` in ${product.selectedVariant}` : ""}`;
  return (
    <Image
      className={styles.photo}
      src={product.image}
      alt={alt}
      width={1200}
      height={1200}
      sizes={sizes}
      quality={90}
      priority={priority}
    />
  );
}
