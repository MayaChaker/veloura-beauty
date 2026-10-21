import Link from "next/link";
import { formatCents } from "../../domain/orders/receipt";
import { formatOrderTime } from "../../domain/orders/summary";
import type { AdminOrderRow } from "../../server/admin/adminOrders";
import { StatusPill } from "../account/OrderParts";
import styles from "./admin.module.css";

/** The orders list: a table on a computer, two lines per order on a phone. */
export default function OrdersTable({ rows }: { rows: AdminOrderRow[] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col">Order</th>
          <th scope="col">Date</th>
          <th scope="col">Customer</th>
          <th scope="col">Area</th>
          <th scope="col">Items</th>
          <th scope="col" className={styles.num}>
            Total
          </th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((order) => (
          <tr key={order.id}>
            <td className={styles.ref}>
              <Link href={`/admin/orders/${order.id}`}>{order.reference}</Link>
              <small>{formatOrderTime(order.placedAt)}</small>
            </td>
            <td className={styles.date}>{formatOrderTime(order.placedAt)}</td>
            <td className={styles.who}>
              {order.name}
              <small>{order.phone}</small>
            </td>
            <td className={styles.area}>{order.area}</td>
            <td className={styles.items}>{order.itemCount}</td>
            <td className={styles.num}>
              <strong>{formatCents(order.totalCents)}</strong>
            </td>
            <td className={styles.st}>
              <StatusPill status={order.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
