"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "@mui/icons-material";
import { brandHref, type Brand } from "../domain/catalogue/catalogue";
import ProductVisual from "../components/product-art/ProductVisual";
import type { Product } from "../types/commerce";
import styles from "./BrandsPage.module.css";

export interface BrandEntry extends Brand {
  categories: string[];
  /** One of the brand's products, to picture it among the featured brands. */
  product?: Product;
}

interface BrandDirectoryProps {
  brands: BrandEntry[];
  featured: BrandEntry[];
}

const CATEGORIES = ["Makeup", "Skincare", "Fragrance", "Haircare"];

/** "Estée" and "estee" match: accents and case are ignored when searching. */
const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const describe = (brand: BrandEntry) =>
  `${brand.categories.join(" · ")} · ${brand.productCount} ${
    brand.productCount === 1 ? "product" : "products"
  }`;

/** Search and category chips over the featured brands and the full A–Z list. */
export default function BrandDirectory({ brands, featured }: BrandDirectoryProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const filtering = Boolean(query.trim() || category);
  const visible = brands.filter(
    (brand) =>
      fold(brand.name).includes(fold(query.trim())) &&
      (!category || brand.categories.includes(category)),
  );
  const chips = [
    { value: "", label: "All", count: brands.length },
    ...CATEGORIES.map((value) => ({
      value,
      label: value,
      count: brands.filter((brand) => brand.categories.includes(value)).length,
    })),
  ];

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="text-label text-muted">The houses</p>
          <h1>
            Brands <em>A–Z</em>
          </h1>
        </div>
        <label className={styles.find}>
          <Search aria-hidden="true" />
          <span className="srOnly">Find a brand</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a brand"
          />
        </label>
      </header>

      <div className={styles.chips} role="group" aria-label="Filter brands by category">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            aria-pressed={category === chip.value}
            onClick={() => setCategory(chip.value)}
          >
            {chip.label}
            <span>{chip.count}</span>
          </button>
        ))}
      </div>

      {!filtering && (
        <section className={styles.featured} aria-labelledby="featured-brands">
          <p className="text-label text-muted">The widest selection</p>
          <h2 id="featured-brands">
            Featured <em>houses</em>
          </h2>
          <ul className={styles.featuredRow}>
            {featured.map((brand) => (
              <li key={brand.slug}>
                <Link href={brandHref(brand.name)} className={styles.tile}>
                  <span className={styles.tilePhoto}>
                    <ProductVisual
                      product={brand.product}
                      sizes="(max-width: 1023px) 45vw, 15vw"
                      decorative
                    />
                  </span>
                  <span className={styles.tileName}>{brand.name}</span>
                  <span className={styles.meta}>{describe(brand)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.all} aria-labelledby="all-brands">
        <div className={styles.allHead}>
          <h2 id="all-brands">
            {filtering ? (
              "Matching brands"
            ) : (
              <>
                All <em>brands</em>
              </>
            )}
          </h2>
          <p className="text-label text-muted" aria-live="polite">
            {visible.length} {visible.length === 1 ? "brand" : "brands"} · A–Z
          </p>
        </div>
        {visible.length ? (
          <ul className={styles.list}>
            {visible.map((brand) => (
              <li key={brand.slug}>
                <Link href={brandHref(brand.name)}>
                  <span className={styles.name}>{brand.name}</span>
                  <span className={styles.meta}>{describe(brand)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>No brand matches “{query.trim()}”.</p>
        )}
      </section>
    </>
  );
}
