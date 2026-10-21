"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import { LOW_STOCK } from "../../domain/admin/dashboard";
import {
  centsToInput,
  parseDollars,
  parseStock,
  wasPriceProblem,
} from "../../domain/admin/products";
import { updateProduct } from "../../server/admin/productActions";
import styles from "./admin.module.css";

export interface EditableProduct {
  id: number;
  priceCents: number;
  wasPriceCents: number | null;
  /** Null when the product has shades: each shade has its own. */
  stock: number | null;
  shades: Array<{ key: string; name: string; swatch: string; stock: number }>;
  soldLast30Days: number;
}

interface Fields {
  price: string;
  was: string;
  stock: string;
  shades: Record<string, string>;
}

const fieldsOf = (product: EditableProduct): Fields => ({
  price: centsToInput(product.priceCents),
  was: centsToInput(product.wasPriceCents),
  stock: String(product.stock ?? ""),
  shades: Object.fromEntries(product.shades.map((shade) => [shade.key, String(shade.stock)])),
});

/**
 * Price, was price and stock for one product. The numbers it loaded are sent back with the
 * changes, so the server can tell if an order moved the stock in the meantime.
 */
export default function ProductForm({ product }: { product: EditableProduct }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fields, setFields] = useState(() => fieldsOf(product));
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // New numbers from the server (after saving or reloading) replace what is in the form.
  const signature = JSON.stringify(product);
  const [loaded, setLoaded] = useState(signature);
  if (loaded !== signature) {
    setLoaded(signature);
    setFields(fieldsOf(product));
    // A reload after a refused save starts clean; a "Saved." message stays.
    if (status && !status.ok) setStatus(null);
  }

  const initial = fieldsOf(product);
  const changed = JSON.stringify(fields) !== JSON.stringify(initial);
  const priceCents = parseDollars(fields.price);
  const wasCents = fields.was.trim() ? parseDollars(fields.was) : null;
  const priceError = priceCents === null || priceCents === 0 ? "Enter a price, e.g. 34.00" : "";
  const wasError =
    fields.was.trim() && wasCents === null
      ? "Enter a price, e.g. 42.00, or leave it empty."
      : priceCents
        ? (wasPriceProblem(priceCents, wasCents) ?? "")
        : "";
  const stockInvalid = (value: string) => parseStock(value) === null;
  const anyStockInvalid = product.shades.length
    ? Object.values(fields.shades).some(stockInvalid)
    : stockInvalid(fields.stock);

  const set = (patch: Partial<Fields>) => {
    setFields((current) => ({ ...current, ...patch }));
    setStatus(null);
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!changed || priceError || wasError || anyStockInvalid || priceCents === null) return;
    const stock =
      !product.shades.length && fields.stock !== initial.stock
        ? { expected: product.stock ?? 0, value: parseStock(fields.stock) ?? 0 }
        : null;
    const shades = product.shades
      .filter((shade) => fields.shades[shade.key] !== initial.shades[shade.key])
      .map((shade) => ({
        key: shade.key,
        expected: shade.stock,
        value: parseStock(fields.shades[shade.key] ?? "") ?? 0,
      }));
    startTransition(async () => {
      const result = await updateProduct({
        productId: product.id,
        priceCents,
        wasPriceCents: wasCents,
        stock,
        shades,
      });
      setStatus(
        result.ok
          ? { ok: true, text: "Saved. The store shows it now." }
          : { ok: false, text: result.error },
      );
      if (result.ok) router.refresh();
    });
  };

  const stocks = product.shades.length
    ? product.shades.map((shade) => shade.stock)
    : [product.stock ?? 0];
  const total = stocks.reduce((sum, stock) => sum + stock, 0);
  const lowest = product.shades.reduce<(typeof product.shades)[number] | null>(
    (low, shade) => (!low || shade.stock < low.stock ? shade : low),
    null,
  );

  return (
    <form className={`${styles.cols} ${styles.formCols}`} onSubmit={save} noValidate>
      <div className={styles.stack}>
        <section className={styles.box} aria-labelledby="price">
          <h2 id="price">Price</h2>
          <div className={styles.fields}>
            <label className={styles.field}>
              <span>Price</span>
              <span className={styles.money} data-invalid={Boolean(priceError) || undefined}>
                $
                <input
                  inputMode="decimal"
                  value={fields.price}
                  onChange={(event) => set({ price: event.target.value })}
                  aria-invalid={Boolean(priceError)}
                />
              </span>
              <small>
                {priceError || (product.shades.length ? "Every shade sells at this price." : " ")}
              </small>
            </label>
            <label className={styles.field}>
              <span>
                Was price <small>(optional)</small>
              </span>
              <span className={styles.money} data-invalid={Boolean(wasError) || undefined}>
                $
                <input
                  inputMode="decimal"
                  value={fields.was}
                  onChange={(event) => set({ was: event.target.value })}
                  aria-invalid={Boolean(wasError)}
                />
              </span>
              <small>{wasError || "Shown crossed out when it is higher than the price."}</small>
            </label>
          </div>
        </section>

        <section className={styles.box} aria-labelledby="stock">
          <h2 id="stock">{product.shades.length ? "Shades and stock" : "Stock"}</h2>
          {product.shades.length ? (
            <table className={styles.shades}>
              <thead>
                <tr>
                  <th scope="col">Shade</th>
                  <th scope="col">In stock</th>
                </tr>
              </thead>
              <tbody>
                {product.shades.map((shade) => {
                  const value = fields.shades[shade.key] ?? "";
                  return (
                    <tr key={shade.key}>
                      <th scope="row">
                        <span className={styles.swatch}>
                          <i style={{ background: shade.swatch }} aria-hidden="true" />
                          {shade.name}
                        </span>
                      </th>
                      <td>
                        <input
                          className={styles.stockInput}
                          inputMode="numeric"
                          aria-label={`${shade.name} in stock`}
                          value={value}
                          data-changed={value !== String(shade.stock) || undefined}
                          aria-invalid={stockInvalid(value)}
                          onChange={(event) =>
                            set({ shades: { ...fields.shades, [shade.key]: event.target.value } })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <label className={styles.field}>
              <span>In stock</span>
              <input
                className={styles.stockInput}
                inputMode="numeric"
                value={fields.stock}
                data-changed={fields.stock !== initial.stock || undefined}
                aria-invalid={stockInvalid(fields.stock)}
                onChange={(event) => set({ stock: event.target.value })}
              />
            </label>
          )}
          {anyStockInvalid && (
            <p className={styles.error}>Stock must be a whole number from 0 to 10,000.</p>
          )}
        </section>
      </div>

      <div className={styles.stack}>
        <section className={styles.box} aria-labelledby="summary">
          <h2 id="summary">Summary</h2>
          <dl className={styles.summary}>
            <div>
              <dt>In stock</dt>
              <dd>
                {total}
                {product.shades.length ? ` across ${product.shades.length} shades` : ""}
              </dd>
            </div>
            {lowest && (
              <div>
                <dt>Lowest</dt>
                <dd data-low={lowest.stock <= LOW_STOCK || undefined}>
                  {lowest.name} · {lowest.stock ? `${lowest.stock} left` : "sold out"}
                </dd>
              </div>
            )}
            <div>
              <dt>Sold, last 30 days</dt>
              <dd>{product.soldLast30Days}</dd>
            </div>
          </dl>
          <div className={styles.saveRow}>
            <Button
              type="submit"
              fullWidth
              disabled={pending || !changed || Boolean(priceError || wasError) || anyStockInvalid}
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <p role="status" className={status && !status.ok ? styles.error : styles.hint}>
              {status ? status.text : changed ? "Unsaved changes" : ""}
            </p>
            {status && !status.ok && (
              <Button variant="text" onClick={() => router.refresh()}>
                Reload the numbers
              </Button>
            )}
          </div>
          <p className={styles.note}>
            Stock also goes down when an order is placed and back up when one is cancelled. If that
            happens while you edit, nothing is saved and you are asked to check the new number.
          </p>
        </section>
      </div>
    </form>
  );
}
