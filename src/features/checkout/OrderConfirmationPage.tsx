"use client";

import { Check } from "@mui/icons-material";
import { money } from "../../lib/money";
import { useCommerce } from "../../hooks/useCommerce";
import Button from "../../components/ui/Button";
import NotFoundPage from "../../views/NotFoundPage";
import CheckoutHeader from "./CheckoutHeader";
import { formatAddress } from "./checkoutForm";
import styles from "./checkout.module.css";

// Lives on its own URL so a refresh (or a shared link on this device) still shows the order.
export default function OrderConfirmationPage({ orderId }: { orderId: string }) {
  const { orders, hydrated } = useCommerce();
  if (!hydrated) return null;
  const order = orders.find((item) => item.id === orderId);
  if (!order) return <NotFoundPage />;
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.page}>
      <CheckoutHeader back={false} />
      <main className={styles.confirmation}>
        <span className={styles.confirmCheck}>
          <Check aria-hidden="true" />
        </span>
        <p className="text-label text-muted">Order {order.reference ?? order.id}</p>
        <h1>Thank you, {order.contact.firstName}.</h1>
        <p className={styles.cardNote}>Your order has been received.</p>
        <dl className={`${styles.card} ${styles.review}`}>
          <div>
            <dt>Items</dt>
            <dd>
              {count} {count === 1 ? "item" : "items"} · {money(order.total)}
            </dd>
          </div>
          {"street" in order.shipping && (
            <div>
              <dt>Deliver to</dt>
              <dd>{formatAddress(order.shipping)}</dd>
            </div>
          )}
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
