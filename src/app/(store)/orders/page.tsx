import Link from "next/link";
import Button from "../../../components/ui/Button";
import { isOpen } from "../../../domain/orders/summary";
import AccountShell from "../../../features/account/AccountShell";
import { OrderRow } from "../../../features/account/OrderParts";
import styles from "../../../features/account/orders.module.css";
import { getUserOrders } from "../../../server/orders/getUserOrders";
import { requireUser } from "../../../server/session";

export const metadata = { title: "Orders", robots: { index: false } };

const TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "In progress" },
  { key: "delivered", label: "Delivered" },
] as const;

export default async function Page({ searchParams }: PageProps<"/orders">) {
  const user = await requireUser("/orders");
  const { status } = await searchParams;
  const tab = TABS.find((item) => item.key === status)?.key ?? "all";
  const orders = await getUserOrders(user.id);
  const inTab = (key: (typeof TABS)[number]["key"]) =>
    orders.filter((order) =>
      key === "open"
        ? isOpen(order.status)
        : key === "delivered"
          ? order.status === "Delivered"
          : true,
    );
  const shown = inTab(tab);

  return (
    <AccountShell user={user} current="/orders" title="Orders">
      {orders.length ? (
        <>
          <ul className={styles.tabs}>
            {TABS.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.key === "all" ? "/orders" : `/orders?status=${item.key}`}
                  aria-current={item.key === tab ? "page" : undefined}
                >
                  {item.label} · {inTab(item.key).length}
                </Link>
              </li>
            ))}
          </ul>
          {shown.length ? (
            <ul className={styles.list}>
              {shown.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No orders here.</p>
          )}
        </>
      ) : (
        <div className={styles.empty}>
          <p>You haven’t placed an order with this account yet.</p>
          <Button href="/shop">Shop all products</Button>
        </div>
      )}
    </AccountShell>
  );
}
