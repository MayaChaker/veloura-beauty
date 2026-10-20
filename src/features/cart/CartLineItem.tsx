import Link from "next/link";
import { money } from "../../lib/money";
import ProductVisual from "../../components/product-art/ProductVisual";
import QuantityStepper from "../../components/ui/QuantityStepper";
import type { CartLine } from "../../types/commerce";
import styles from "./CartDrawer.module.css";
import { DEFAULT_STOCK } from "../../domain/commerce/commerceConfig";

interface CartLineItemProps {
  item: CartLine;
  onChangeQuantity: (cartId: string, delta: number) => void;
  onRemove: (cartId: string) => void;
  /** Called when the shopper follows the link to the product, so the bag can close. */
  onNavigate: () => void;
}

/** One bag line: photograph, brand, name, shade, quantity (capped at stock) and price. */
export default function CartLineItem({
  item,
  onChangeQuantity,
  onRemove,
  onNavigate,
}: CartLineItemProps) {
  const href = `/product/${item.slug}${item.variantId ? `?variant=${item.variantId}` : ""}`;
  return (
    <article className={styles.line}>
      <Link href={href} className={styles.thumb} onClick={onNavigate} tabIndex={-1}>
        <ProductVisual product={item} sizes="96px" decorative />
      </Link>
      <div className={styles.lineInfo}>
        <p className="text-label">{item.brand}</p>
        <div className={styles.lineTop}>
          <Link href={href} onClick={onNavigate}>
            {item.name}
          </Link>
          <span>{money(item.price * item.quantity)}</span>
        </div>
        <p className={styles.lineMeta}>
          {item.swatch && <i style={{ background: item.swatch }} aria-hidden="true" />}
          {item.selectedVariant && `${item.selectedVariant} · `}
          {item.size}
          {item.quantity > 1 && ` · ${money(item.price)} each`}
        </p>
        <div className={styles.lineActions}>
          <QuantityStepper
            size="small"
            value={item.quantity}
            itemName={item.name}
            max={item.stock ?? DEFAULT_STOCK}
            min={0}
            onChange={(next) => onChangeQuantity(item.cartId, next - item.quantity)}
          />
          <button type="button" className={styles.remove} onClick={() => onRemove(item.cartId)}>
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}
