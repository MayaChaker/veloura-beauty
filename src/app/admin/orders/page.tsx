import Link from "next/link";
import OrdersTable from "../../../features/admin/OrdersTable";
import styles from "../../../features/admin/admin.module.css";
import { ADMIN_TABS, getAdminOrders, type AdminTab } from "../../../server/admin/adminOrders";
import { adminTitle, requireAdmin } from "../../../server/session";

export const generateMetadata = adminTitle("Orders");

export default async function Page({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin("/admin/orders");
  const { tab: tabParam, q } = await searchParams;
  const tab: AdminTab = ADMIN_TABS.find((item) => item.key === tabParam)?.key ?? "all";
  const query = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const { rows, total, counts } = await getAdminOrders(tab, query);

  const href = (key: AdminTab) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("tab", key);
    if (query) params.set("q", query);
    const search = params.toString();
    return search ? `/admin/orders?${search}` : "/admin/orders";
  };

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="text-label text-muted">Admin</p>
          <h1 className={styles.title}>Orders</h1>
        </div>
        {/* A plain GET form: the search lives in the URL, so it can be shared and reloaded. */}
        <form className={styles.search} role="search" action="/admin/orders">
          {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
          <label className="srOnly" htmlFor="order-search">
            Search orders
          </label>
          <input
            id="order-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by reference, name or phone"
          />
        </form>
      </header>

      <ul className={styles.tabs}>
        {ADMIN_TABS.map((item) => (
          <li key={item.key}>
            <Link href={href(item.key)} aria-current={item.key === tab ? "page" : undefined}>
              {item.label} · {counts[item.key]}
            </Link>
          </li>
        ))}
      </ul>

      {rows.length ? (
        <>
          <OrdersTable rows={rows} />
          <p className={styles.pager}>
            <span>
              Showing {rows.length} of {total}
            </span>
            <span>Newest first</span>
          </p>
        </>
      ) : (
        <p className={styles.empty}>
          {query ? `No orders match “${query}”.` : "No orders here yet."}
        </p>
      )}
    </>
  );
}
