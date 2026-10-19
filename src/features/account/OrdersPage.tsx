"use client";

import Link from "next/link";
import Button from "../../components/ui/Button";
import ProductVisual from "../../components/product-art/ProductVisual";
import { useCatalogue } from "../../hooks/useCatalogue";
import { useCommerce } from "../../hooks/useCommerce";
import { money } from "../../lib/money";
import AccountLayout from "./AccountLayout";
import styles from "./account.module.css";

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso),
  );

/** Orders placed in this browser, newest first. */
export default function OrdersPage() {
  const catalogue = useCatalogue();
  const { orders, hydrated } = useCommerce();

  return (
    <AccountLayout title="Order history" current="/orders">
      {!hydrated ? null : orders.length ? (
        <ul className={styles.orders}>
          {orders.map((order) => {
            const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return (
              <li key={order.id} className={styles.order}>
                <div>
                  <p className={styles.orderTop}>
                    <span>{order.id}</span>
                    <span>{money(order.total)}</span>
                  </p>
                  <p className={styles.orderMeta}>
                    {formatDate(order.placedAt)} · {count} {count === 1 ? "item" : "items"} ·{" "}
                    {order.payment}
                  </p>
                </div>
                <ul className={styles.thumbs} aria-label="Products">
                  {order.items.map((item) => {
                    const product = catalogue.getById(item.productId);
                    return (
                      <li key={`${item.productId}-${item.variantId ?? ""}`} title={product?.name}>
                        <ProductVisual product={product} sizes="56px" decorative />
                      </li>
                    );
                  })}
                </ul>
                <Link href={`/checkout/confirmation/${order.id}`}>View order</Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          <p>You haven’t placed an order in this browser yet.</p>
          <Button href="/shop">Shop all products</Button>
        </div>
      )}
    </AccountLayout>
  );
}
