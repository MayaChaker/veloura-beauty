"use client";

import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCatalogue } from "../../hooks/useCatalogue";
import ProductCard from "../../features/products/ProductCard";
import ProductGrid, { ProductGridItem } from "../../components/ui/ProductGrid";
import SectionHeader from "../../components/ui/SectionHeader";
import styles from "./NewIn.module.css";

/** The latest arrivals, four across under a section header. */
export default function NewIn() {
  const newIn = useCatalogue()
    .products.filter((product) => product.isNew)
    .slice(0, 4);
  const { openCart } = useCartDrawer();
  if (!newIn.length) return null;
  return (
    <section className={styles.section} aria-labelledby="new-in-title">
      <SectionHeader
        id="new-in-title"
        eyebrow="Just arrived"
        title="New"
        emphasis="in"
        link={{ label: "Shop all new in", href: "/shop?collection=new" }}
      />
      <ProductGrid>
        {newIn.map((product) => (
          <ProductGridItem key={product.id}>
            <ProductCard product={product} onAdded={openCart} />
          </ProductGridItem>
        ))}
      </ProductGrid>
    </section>
  );
}
