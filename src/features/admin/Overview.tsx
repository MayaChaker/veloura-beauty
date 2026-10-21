import Image from "next/image";
import Link from "next/link";
import { RANGES, formatMoney } from "../../domain/admin/dashboard";
import type { Dashboard } from "../../server/admin/dashboard";
import RevenueChart from "./RevenueChart";
import styles from "./admin.module.css";

/** The admin's first page: what needs doing, how sales are going, and what sells. */
export default function Overview({ data }: { data: Dashboard }) {
  const { days, summary } = data;
  const change =
    summary.change === null
      ? "Nothing to compare with yet"
      : `${summary.change >= 0 ? "+" : "−"}${Math.abs(summary.change)}% on the ${days} days before`;
  const most = Math.max(...data.bestSellers.map((product) => product.units), 1);

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="text-label text-muted">Admin</p>
          <h1 className={styles.title}>Overview</h1>
        </div>
        <nav className={styles.range} aria-label="Period">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={range === 30 ? "/admin" : `/admin?days=${range}`}
              aria-current={range === days ? "page" : undefined}
            >
              {range} days
            </Link>
          ))}
        </nav>
      </header>

      <dl className={styles.kpis}>
        <div className={styles.kpiDark}>
          <dt>To ship</dt>
          <dd>{data.toShipCount}</dd>
          <dd>{data.oldestWaiting ? `Oldest waiting ${data.oldestWaiting}` : "Nothing waiting"}</dd>
        </div>
        <div>
          <dt>Revenue</dt>
          <dd>{formatMoney(summary.revenueCents)}</dd>
          <dd>{change}</dd>
        </div>
        <div>
          <dt>Orders</dt>
          <dd>{summary.orders}</dd>
          <dd>{summary.cancelled} cancelled</dd>
        </div>
        <div>
          <dt>Average order</dt>
          <dd>{formatMoney(summary.averageCents)}</dd>
          <dd>Cash on delivery</dd>
        </div>
      </dl>

      <section className={styles.box} aria-labelledby="revenue">
        <header className={styles.boxHead}>
          <h2 id="revenue">Revenue by day</h2>
          <p className="text-label text-muted">Excludes cancelled orders</p>
        </header>
        {summary.revenueCents ? (
          <RevenueChart series={summary.series} />
        ) : (
          <p className={styles.quiet}>No sales in the last {days} days.</p>
        )}
      </section>

      <div className={styles.panels}>
        <section className={styles.box} aria-labelledby="to-ship">
          <header className={styles.boxHead}>
            <h2 id="to-ship">To ship</h2>
            <Link href="/admin/orders?tab=to-ship" className={styles.more}>
              All orders
            </Link>
          </header>
          {data.toShip.length ? (
            <ul className={styles.queue}>
              {data.toShip.map((order) => (
                <li key={order.id}>
                  <p>
                    <Link href={`/admin/orders/${order.id}`}>{order.reference}</Link>
                    <small>
                      {order.name} · {order.area} · {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </small>
                  </p>
                  <span className={styles.age}>{order.age}</span>
                  <strong>{formatMoney(order.totalCents)}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.quiet}>Every order has been shipped.</p>
          )}
        </section>

        <section className={styles.box} aria-labelledby="low-stock">
          <header className={styles.boxHead}>
            <h2 id="low-stock">Low stock</h2>
          </header>
          {data.lowStock.length ? (
            <ul className={styles.stock}>
              {data.lowStock.map((line) => (
                <li key={line.key}>
                  <span className={styles.thumb}>
                    {line.image && (
                      <Image src={line.image} alt="" width={88} height={110} sizes="44px" />
                    )}
                  </span>
                  <p>
                    <Link href={`/product/${line.slug}`}>{line.name}</Link>
                    <small>{line.detail}</small>
                  </p>
                  <strong data-out={line.stock === 0 || undefined}>
                    {line.stock ? `${line.stock} left` : "Sold out"}
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.quiet}>Nothing is running low.</p>
          )}
        </section>
      </div>

      <section className={styles.box} aria-labelledby="best">
        <header className={styles.boxHead}>
          <h2 id="best">Best sellers</h2>
          <p className="text-label text-muted">Last {days} days · by units sold</p>
        </header>
        {data.bestSellers.length ? (
          <table className={styles.best}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="srOnly">Rank</span>
                </th>
                <th scope="col">Product</th>
                <th scope="col">Units</th>
                <th scope="col" className={styles.num}>
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {data.bestSellers.map((product, index) => (
                <tr key={product.productId}>
                  <td className={styles.rank}>{index + 1}</td>
                  <td>
                    <span className={styles.product}>
                      <span className={styles.thumb}>
                        {product.image && (
                          <Image src={product.image} alt="" width={88} height={110} sizes="44px" />
                        )}
                      </span>
                      <span>
                        <strong>{product.name}</strong>
                        <small>{product.brand}</small>
                      </span>
                    </span>
                  </td>
                  <td className={styles.units}>
                    <i style={{ width: `${(product.units / most) * 100}%` }} aria-hidden="true" />
                    <strong>{product.units}</strong>
                  </td>
                  <td className={styles.num}>{formatMoney(product.revenueCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.quiet}>No sales in the last {days} days.</p>
        )}
      </section>
    </>
  );
}
