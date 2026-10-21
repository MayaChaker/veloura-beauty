import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import OrderActions from "../../../../features/admin/OrderActions";
import styles from "../../../../features/admin/admin.module.css";
import { StatusPill } from "../../../../features/account/OrderParts";
import { formatCents } from "../../../../domain/orders/receipt";
import { formatOrderDate, formatOrderTime } from "../../../../domain/orders/summary";
import { getAdminOrder } from "../../../../server/admin/adminOrders";
import { adminTitle, requireAdmin } from "../../../../server/session";

export const generateMetadata = adminTitle("Order");

export default async function Page({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  await requireAdmin(`/admin/orders/${id}`);
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const time = formatOrderTime(order.placedAt).split(", ")[1];
  const totals = [
    ["Subtotal", order.subtotalCents],
    ...(order.discountCents
      ? [[`Promo ${order.promoCode ?? ""}`.trim(), -order.discountCents] as const]
      : []),
    ["Delivery", order.shippingCents],
  ] as const;

  return (
    <>
      <Link href="/admin/orders" className={styles.back}>
        ← Orders
      </Link>
      <div className={styles.orderTitle}>
        <h1 className={styles.title}>{order.reference}</h1>
        <StatusPill status={order.status} />
      </div>
      <p className={styles.hint}>
        Placed {formatOrderDate(order.placedAt)} at {time} · Cash on delivery
      </p>

      <div className={styles.cols}>
        <div className={styles.stack}>
          <section className={styles.box} aria-labelledby="items">
            <h2 id="items">Items</h2>
            <ul className={styles.lines}>
              {order.items.map((item) => (
                <li key={item.id}>
                  <span className={styles.thumb}>
                    {item.image && (
                      <Image src={item.image} alt="" width={112} height={140} sizes="56px" />
                    )}
                  </span>
                  <p>
                    <strong>{item.name}</strong>
                    <small>{[item.brand, item.shade].filter(Boolean).join(" · ")}</small>
                  </p>
                  <span className={styles.qty}>× {item.quantity}</span>
                  <strong>{formatCents(item.unitPriceCents * item.quantity)}</strong>
                </li>
              ))}
            </ul>
            <dl className={styles.totals}>
              {totals.map(([label, cents]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{cents < 0 ? `−${formatCents(-cents)}` : formatCents(cents)}</dd>
                </div>
              ))}
              <div className={styles.grand}>
                <dt>Total</dt>
                <dd>{formatCents(order.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.box} aria-labelledby="delivery">
            <h2 id="delivery">Delivery</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Area</dt>
                <dd>{[order.area, order.country].filter(Boolean).join(", ")}</dd>
              </div>
              <div>
                <dt>Street and building</dt>
                <dd>{[order.street, order.building, order.floor].filter(Boolean).join(", ")}</dd>
              </div>
              {order.directions && (
                <div>
                  <dt>Directions</dt>
                  <dd>{order.directions}</dd>
                </div>
              )}
              {order.latitude !== null && order.longitude !== null && (
                <div>
                  <dt>Pin</dt>
                  <dd>
                    <a
                      href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <div className={styles.stack}>
          <section className={styles.box} aria-labelledby="status">
            <h2 id="status">Status</h2>
            <OrderActions orderId={order.id} status={order.status} totalCents={order.totalCents} />
          </section>

          <section className={styles.box} aria-labelledby="customer">
            <h2 id="customer">Customer</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Name</dt>
                <dd>
                  {order.firstName} {order.lastName}
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${order.phone.replace(/[^\d+]/g, "")}`}>{order.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${order.email}`}>{order.email}</a>
                </dd>
              </div>
              <div>
                <dt>Account</dt>
                <dd>
                  {order.accountOrders === null
                    ? "Guest checkout"
                    : `Signed in · ${order.accountOrders} ${order.accountOrders === 1 ? "order" : "orders"}`}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}
