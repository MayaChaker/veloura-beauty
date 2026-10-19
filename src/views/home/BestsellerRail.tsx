"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCatalogue } from "../../hooks/useCatalogue";
import ProductCard from "../../features/products/ProductCard";
import SectionHeader from "../../components/ui/SectionHeader";
import styles from "./BestsellerRail.module.css";

/** A horizontal rail of bestsellers: arrows on desktop, swipe with snapping on phones. */
export default function BestsellerRail() {
  const bestsellers = useCatalogue()
    .products.filter((product) => product.isBestseller)
    .slice(0, 8);
  const { openCart } = useCartDrawer();
  const trackRef = useRef<HTMLUListElement>(null);

  const scroll = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    track.scrollBy({ left: direction * (card.clientWidth + 24), behavior: "smooth" });
  };

  return (
    <section className={styles.section} aria-labelledby="bestsellers-title">
      <div className={styles.head}>
        <SectionHeader
          id="bestsellers-title"
          eyebrow="Most loved"
          title="Bestsellers"
          link={{ label: "Shop all", href: "/shop?collection=bestsellers" }}
        />
        <div className={styles.arrows}>
          <button type="button" onClick={() => scroll(-1)} aria-label="Previous products">
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Next products">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul ref={trackRef} className={styles.track}>
        {bestsellers.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} onAdded={openCart} />
          </li>
        ))}
      </ul>
    </section>
  );
}
