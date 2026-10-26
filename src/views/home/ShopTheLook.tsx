"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCatalogue } from "../../hooks/useCatalogue";
import { useCommerce } from "../../hooks/useCommerce";
import { money } from "../../lib/money";
import Button from "../../components/ui/Button";
import type { Product } from "../../types/commerce";
import styles from "./ShopTheLook.module.css";

/** The products that recreate the campaign's red lip. None has shades, so all three add at once. */
const LOOK_SLUGS = [
  "chanel-rouge-allure",
  "armani-luminous-silk-foundation",
  "too-faced-better-than-sex-mascara",
];

/** An editorial break between the product rows: the campaign photograph and its products. */
export default function ShopTheLook() {
  const { getBySlug } = useCatalogue();
  const look = LOOK_SLUGS.map((slug) => getBySlug(slug)).filter(
    (product): product is Product => product !== undefined,
  );
  const total = look.reduce((sum, product) => sum + product.price, 0);
  const { addToCart } = useCommerce();
  const { openCart } = useCartDrawer();
  const [added, setAdded] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const add = (products: Product[]) => {
    products.forEach((product) => addToCart(product));
    openCart();
    setAdded(true);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setAdded(false), 1600);
  };

  if (look.length < 3) return null;

  return (
    <section className={styles.section} aria-labelledby="look-title">
      <div className={styles.image}>
        <Image
          src="/images/campaign/makeup.webp"
          alt="A woman with a red lip holding a gold lipstick"
          fill
          sizes="(max-width: 1023px) 100vw, 58vw"
          quality={85}
        />
      </div>
      <div className={styles.panel}>
        <p className="text-label text-muted">Shop the look</p>
        <h2 id="look-title">
          The red <em>lip</em>
        </h2>
        <p className={styles.copy}>
          A satin red, a luminous base and lashes with volume: three products, one look.
        </p>
        <ol className={styles.list}>
          {look.map((product) => (
            <li key={product.id}>
              {/* The same link as the name beside it: hidden from screen readers and the tab
                  order, so the product is announced once, by name. */}
              <Link
                href={`/product/${product.slug}`}
                className={styles.thumb}
                aria-hidden="true"
                tabIndex={-1}
              >
                {product.image && (
                  <Image src={product.image} alt="" fill sizes="72px" quality={80} />
                )}
              </Link>
              <div>
                <p className="text-label">{product.brand}</p>
                <Link href={`/product/${product.slug}`} className={styles.name}>
                  {product.name}
                </Link>
              </div>
              <div className={styles.buy}>
                <span>{money(product.price)}</span>
                <button
                  type="button"
                  onClick={() => add([product])}
                  aria-label={`Add ${product.name} to bag`}
                >
                  Add
                </button>
              </div>
            </li>
          ))}
        </ol>
        <Button fullWidth onClick={() => add(look)}>
          {added ? "Added to bag" : `Add all three · ${money(total)}`}
        </Button>
      </div>
    </section>
  );
}
