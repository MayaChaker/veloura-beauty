import Image from "next/image";
import Link from "next/link";
import {
  ORDER_STEPS,
  formatOrderDate,
  stepsDone,
  type OrderStatus,
  type OrderSummary,
} from "../../domain/orders/summary";
import { formatCents } from "../../domain/orders/receipt";
import styles from "./orders.module.css";

/** The order's status as a small pill, coloured by stage. */
export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span className={styles.pill} data-status={status.toLowerCase()}>
      <i aria-hidden="true" />
      {status}
    </span>
  );
}

/** Placed → Shipped → Delivered, with the steps reached so far filled in. */
export function OrderTrack({ status }: { status: OrderStatus }) {
  if (status === "Cancelled") return null;
  const done = stepsDone(status);
  return (
    <ol className={styles.track} aria-label={`Order ${status.toLowerCase()}`}>
      {ORDER_STEPS.map((step, index) => (
        <li key={step} data-done={index < done}>
          {step}
        </li>
      ))}
    </ol>
  );
}

export function OrderThumbs({ images }: { images: OrderSummary["images"] }) {
  return (
    <ul className={styles.thumbs}>
      {images.map((image, index) => (
        <li key={index} title={image.alt}>
          {image.src && <Image src={image.src} alt="" width={112} height={140} sizes="56px" />}
        </li>
      ))}
    </ul>
  );
}

/** One line of the order history; the whole row opens the order. */
export function OrderRow({ order }: { order: OrderSummary }) {
  return (
    <li>
      <Link className={styles.row} href={`/checkout/confirmation/${order.id}`}>
        <span className={styles.ref}>
          <strong>{order.reference}</strong>
          <span>
            {formatOrderDate(order.placedAt)} · {order.itemCount}{" "}
            {order.itemCount === 1 ? "item" : "items"}
          </span>
        </span>
        <OrderThumbs images={order.images} />
        <StatusPill status={order.status} />
        <span className={styles.total}>{formatCents(order.totalCents)}</span>
      </Link>
    </li>
  );
}
