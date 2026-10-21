import Image from "next/image";
import Link from "next/link";
import { LOW_STOCK } from "../../domain/admin/dashboard";
import { formatCents } from "../../domain/orders/receipt";
import type { AdminProductRow } from "../../server/admin/adminProducts";
import styles from "./admin.module.css";

/** "Sold out", "3 left" or the number, coloured by the lowest product or shade. */
function StockLabel({ row }: { row: AdminProductRow }) {
  const state = row.lowest === 0 ? "out" : row.lowest <= LOW_STOCK ? "low" : undefined;
  const text =
    row.stock === 0
      ? "Sold out"
      : !row.shades && row.stock <= LOW_STOCK
        ? `${row.stock} left`
        : String(row.stock);
  return (
    <span className={styles.stockValue} data-state={state}>
      {text}
      {text === String(row.stock) && <span className={styles.phoneOnly}> in stock</span>}
      {row.shades > 0 && state && row.stock > 0 && (
        <small>{row.lowest === 0 ? "A shade is sold out" : "A shade is low"}</small>
      )}
    </span>
  );
}

/** The products list: a table on a computer, two lines per product on a phone. */
export default function ProductsTable({ rows }: { rows: AdminProductRow[] }) {
  return (
    <table className={`${styles.table} ${styles.productsTable}`}>
      <thead>
        <tr>
          <th scope="col">Product</th>
          <th scope="col">Category</th>
          <th scope="col" className={styles.num}>
            Price
          </th>
          <th scope="col" className={styles.num}>
            In stock
          </th>
          <th scope="col">Shades</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className={styles.ref}>
              <span className={styles.product}>
                <span className={styles.thumb}>
                  {row.image && (
                    <Image src={row.image} alt="" width={88} height={110} sizes="44px" />
                  )}
                </span>
                <span>
                  <Link href={`/admin/products/${row.id}`}>{row.name}</Link>
                  <small>{row.brand}</small>
                </span>
              </span>
            </td>
            <td className={styles.area}>{row.category}</td>
            <td className={styles.num}>
              <strong>{formatCents(row.priceCents)}</strong>
            </td>
            <td className={`${styles.num} ${styles.st}`}>
              <StockLabel row={row} />
            </td>
            <td className={styles.items}>{row.shades || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
