import Link from "next/link";
import ProductsTable from "../../../features/admin/ProductsTable";
import styles from "../../../features/admin/admin.module.css";
import {
  getAdminProducts,
  parseProductTab,
  type ProductTab,
} from "../../../server/admin/adminProducts";
import { adminTitle, requireAdmin } from "../../../server/session";

export const generateMetadata = adminTitle("Products");

export default async function Page({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin("/admin/products");
  const { tab: tabParam, q } = await searchParams;
  const tab = parseProductTab(tabParam);
  const query = (typeof q === "string" ? q : "").trim().slice(0, 100);
  const { rows, tabs } = await getAdminProducts(tab, query);

  const href = (key: ProductTab) => {
    const params = new URLSearchParams();
    if (key !== "all") params.set("tab", key);
    if (query) params.set("q", query);
    const search = params.toString();
    return search ? `/admin/products?${search}` : "/admin/products";
  };

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="text-label text-muted">Admin</p>
          <h1 className={styles.title}>Products</h1>
        </div>
        <form className={styles.search} role="search" action="/admin/products">
          {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
          <label className="srOnly" htmlFor="product-search">
            Search products
          </label>
          <input
            id="product-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by name or brand"
          />
        </form>
      </header>

      <ul className={styles.tabs}>
        {tabs.map((item) => (
          <li key={item.key}>
            <Link href={href(item.key)} aria-current={item.key === tab ? "page" : undefined}>
              {item.label} · {item.count}
            </Link>
          </li>
        ))}
      </ul>

      {rows.length ? (
        <>
          <ProductsTable rows={rows} />
          <p className={styles.pager}>
            <span>
              {rows.length} {rows.length === 1 ? "product" : "products"}
            </span>
            <span>Store order</span>
          </p>
        </>
      ) : (
        <p className={styles.empty}>
          {query
            ? `No products match “${query}”.`
            : tab === "low-stock"
              ? "Nothing is running low."
              : "No products here."}
        </p>
      )}
    </>
  );
}
