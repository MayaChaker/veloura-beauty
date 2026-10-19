"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Close, ShoppingBagOutlined } from "@mui/icons-material";
import { FREE_SHIPPING_THRESHOLD } from "../../domain/commerce/commerceConfig";
import { money } from "../../lib/money";
import { useCatalogue } from "../../hooks/useCatalogue";
import { useCommerce } from "../../hooks/useCommerce";
import { useModalDialog } from "../../hooks/useModalDialog";
import Button from "../../components/ui/Button";
import ProductVisual from "../../components/product-art/ProductVisual";
import { MOTION } from "../../theme/tokens";
import CartLineItem from "./CartLineItem";
import styles from "./CartDrawer.module.css";

const itemCount = (count: number) => `${count} ${count === 1 ? "item" : "items"}`;

interface CartDrawerProps {
  open: boolean;
  close: () => void;
}

/** The bag, sliding in from the right: delivery progress, lines, one suggestion, subtotal. */
export default function CartDrawer({ open, close }: CartDrawerProps) {
  const { products } = useCatalogue();
  const { cart, totals, updateQuantity, removeFromCart, addToCart } = useCommerce();
  const router = useRouter();
  const drawerRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useModalDialog(open, drawerRef, close, closeRef);

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const merchandise = totals.subtotal - totals.discount;
  const progress = Math.min(100, Math.round((merchandise / FREE_SHIPPING_THRESHOLD) * 100));
  // One suggestion: a single-shade product from the same category as the first line.
  const first = cart[0];
  const suggestion = products.find(
    (product) =>
      !product.variants &&
      product.category === first?.category &&
      !cart.some((item) => item.productId === product.id),
  );

  const checkout = () => {
    close();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            className={styles.overlay}
            aria-label="Close bag"
            tabIndex={-1}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            ref={drawerRef}
            className={styles.drawer}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={MOTION.drawer}
            aria-modal="true"
            role="dialog"
            aria-labelledby="bag-title"
          >
            <header className={styles.head}>
              <h2 id="bag-title">Your bag {count > 0 && <span>{itemCount(count)}</span>}</h2>
              <button
                ref={closeRef}
                className={styles.close}
                onClick={close}
                aria-label="Close bag"
              >
                <Close aria-hidden="true" />
              </button>
            </header>

            {cart.length ? (
              <>
                <div className={styles.progress}>
                  <p>
                    {totals.freeShippingRemaining > 0 ? (
                      <>
                        You are <strong>{money(totals.freeShippingRemaining)}</strong> away from
                        complimentary delivery
                      </>
                    ) : (
                      "Your order qualifies for complimentary delivery"
                    )}
                  </p>
                  <div className={styles.bar} aria-hidden="true">
                    <i style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className={styles.lines}>
                  {cart.map((item) => (
                    <CartLineItem
                      key={item.cartId}
                      item={item}
                      onChangeQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      onNavigate={close}
                    />
                  ))}
                  {suggestion && (
                    <div className={styles.suggestion}>
                      <p className="text-label text-muted">Pairs well</p>
                      <div>
                        <span className={styles.suggestionThumb}>
                          <ProductVisual product={suggestion} sizes="64px" decorative />
                        </span>
                        <p>
                          {suggestion.name}
                          <small>
                            {suggestion.brand} · {money(suggestion.price)}
                          </small>
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() => addToCart(suggestion)}
                          aria-label={`Add ${suggestion.name} to bag`}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <footer className={styles.foot}>
                  <p className={styles.subtotal}>
                    <span>Subtotal</span>
                    <strong>{money(merchandise)}</strong>
                  </p>
                  <p className={styles.footNote}>
                    Delivery and promo codes are applied at checkout.
                  </p>
                  <Button fullWidth onClick={checkout}>
                    Checkout
                  </Button>
                  <button type="button" className={styles.continue} onClick={close}>
                    Continue shopping
                  </button>
                </footer>
              </>
            ) : (
              <div className={styles.empty}>
                <ShoppingBagOutlined aria-hidden="true" />
                <h3>Your bag is empty</h3>
                <p>Discover makeup, skincare, fragrance and haircare from the houses you love.</p>
                <Button href="/shop" onClick={close}>
                  Shop all products
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
