"use client";

import { Check } from "@mui/icons-material";
import Button from "../../components/ui/Button";
import { formatCents, itemCount, type OrderReceipt } from "../../domain/orders/receipt";
import CheckoutHeader from "./CheckoutHeader";
import styles from "./checkout.module.css";

/**
 * The order as the server saved it, on its own URL: it can be refreshed or opened again from
 * the confirmation email, on any device.
 */
export default function OrderConfirmationPage({ order }: { order: OrderReceipt }) {
  const count = itemCount(order);
  return (
    <div className={styles.page}>
      <CheckoutHeader back={false} />
      <main className={styles.confirmation}>
        <span className={styles.confirmCheck}>
          <Check aria-hidden="true" />
        </span>
        <p className="text-label text-muted">Order {order.reference}</p>
        <h1>Thank you, {order.firstName}.</h1>
        <p className={styles.cardNote}>
          Your order has been received. Keep your order number for any question about it.
        </p>

        <section className={`${styles.card} ${styles.receipt}`} aria-label="Your order">
          <ul>
            {order.items.map((item, index) => (
              <li key={index}>
                <span>
                  <small>{item.brand}</small>
                  {item.name}
                  {item.shade && <small>{item.shade}</small>}
                </span>
                <span className="text-muted">× {item.quantity}</span>
                <span>{formatCents(item.unitPriceCents * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div>
              <dt>
                Subtotal · {count} {count === 1 ? "item" : "items"}
              </dt>
              <dd>{formatCents(order.subtotalCents)}</dd>
            </div>
            {order.discountCents > 0 && (
              <div>
                <dt>Promotion{order.promoCode ? ` (${order.promoCode})` : ""}</dt>
                <dd>−{formatCents(order.discountCents)}</dd>
              </div>
            )}
            <div>
              <dt>Delivery</dt>
              <dd>{order.shippingCents ? formatCents(order.shippingCents) : "Free"}</dd>
            </div>
            <div className={styles.receiptTotal}>
              <dt>Total</dt>
              <dd>{formatCents(order.totalCents)}</dd>
            </div>
          </dl>
        </section>

        <dl className={`${styles.card} ${styles.review}`}>
          <div>
            <dt>Deliver to</dt>
            <dd>{order.address}</dd>
          </div>
          <div>
            <dt>Payment</dt>
            <dd>{order.payment}</dd>
          </div>
        </dl>
        <Button href="/shop">Continue shopping</Button>
      </main>
    </div>
  );
}
