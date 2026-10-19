"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, LocalShippingOutlined, Replay } from "@mui/icons-material";
import { brandHref } from "../../domain/catalogue/catalogue";
import { POLICIES } from "../../data/policies";
import { FREE_SHIPPING_THRESHOLD } from "../../domain/commerce/commerceConfig";
import { money } from "../../lib/money";
import Accordion from "../../components/ui/Accordion";
import Button from "../../components/ui/Button";
import Price from "../../components/ui/Price";
import QuantityStepper from "../../components/ui/QuantityStepper";
import type { Product, Variant } from "../../types/commerce";
import WishlistButton from "../wishlist/WishlistButton";
import ShadeSwatches from "./ShadeSwatches";
import styles from "./ProductPage.module.css";

interface ProductPurchaseProps {
  product: Product;
  shade?: Variant;
  price: number;
  /** How many can be bought; 0 when out of stock. */
  stock: number;
  onSelectShade: (variantId: string) => void;
  onAdd: (quantity: number) => void;
}

/** The buying column: name, price, shade, quantity, add to bag, then the details. */
export default function ProductPurchase({
  product,
  shade,
  price,
  stock,
  onSelectShade,
  onAdd,
}: ProductPurchaseProps) {
  const [quantity, setQuantity] = useState(1);
  const [ctaVisible, setCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLDivElement>(null);
  const available = stock > 0;
  const shipping = POLICIES.shipping?.sections ?? [];

  // On phones a slim bar keeps "Add to bag" in reach once the main button scrolls away.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) =>
      setCtaVisible(entry?.isIntersecting ?? true),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const add = () => onAdd(Math.min(quantity, stock));
  const addLabel = available ? `Add to bag · ${money(price * quantity)}` : "Out of stock";

  return (
    <div className={styles.purchase}>
      <Link href={brandHref(product.brand)} className={`text-label ${styles.brand}`}>
        {product.brand}
      </Link>
      <h1 className={styles.name}>{product.name}</h1>
      <p className={styles.note}>{product.note}</p>
      <div className={styles.priceRow}>
        <Price amount={price} compareAt={product.originalPrice} size="large" />
        <span className="text-muted">{product.size}</span>
      </div>
      <p className={styles.description}>{product.description}</p>

      {product.variants && (
        <div className={styles.shades}>
          <p className={styles.shadeLabel}>
            <span>
              Shade: <strong>{shade?.name}</strong>
            </span>
            <span className="text-muted">{product.variants.length} shades</span>
          </p>
          <ShadeSwatches
            productName={product.name}
            variants={product.variants}
            selectedId={shade?.id}
            onSelect={onSelectShade}
            size="large"
          />
        </div>
      )}

      <div className={styles.cta} ref={ctaRef}>
        {available && (
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            itemName={product.name}
            max={stock}
          />
        )}
        <Button onClick={add} disabled={!available} fullWidth>
          {addLabel}
        </Button>
        <WishlistButton
          productId={product.id}
          productName={product.name}
          className={styles.wishlist}
        />
      </div>
      {available && (
        <p className={styles.stock}>
          <Check aria-hidden="true" /> In stock, ready to ship
        </p>
      )}

      <ul className={styles.services}>
        <li>
          <LocalShippingOutlined aria-hidden="true" /> Complimentary delivery on orders over $
          {FREE_SHIPPING_THRESHOLD}
        </li>
        <li>
          <Replay aria-hidden="true" /> Free returns within 30 days
        </li>
      </ul>

      <Accordion
        defaultOpen="details"
        items={[
          {
            id: "details",
            title: "Details",
            content: (
              <>
                <dl className={styles.facts}>
                  <dt>Texture</dt>
                  <dd>{product.texture}</dd>
                  <dt>Finish</dt>
                  <dd>{product.finish}</dd>
                  <dt>Size</dt>
                  <dd>{product.size}</dd>
                </dl>
                <ul className={styles.benefits}>
                  {product.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </>
            ),
          },
          { id: "ingredients", title: "Key ingredients", content: <p>{product.ingredients}</p> },
          {
            id: "delivery",
            title: "Delivery and returns",
            content: (
              <>
                {shipping.slice(0, 2).map(([heading, body]) => (
                  <p key={heading}>{body}</p>
                ))}
                <p>
                  <Link href="/care/shipping">Delivery and returns policy</Link>
                </p>
              </>
            ),
          },
        ]}
      />

      {available && (
        <div className={styles.stickyBar} data-visible={!ctaVisible} aria-hidden={ctaVisible}>
          <p>
            <strong>{money(price)}</strong>
            {shade ? `Shade: ${shade.name}` : product.size}
          </p>
          <Button onClick={add} tabIndex={ctaVisible ? -1 : undefined}>
            Add to bag
          </Button>
        </div>
      )}
    </div>
  );
}
