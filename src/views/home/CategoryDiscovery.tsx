import Image from "next/image";
import Link from "next/link";
import { CATEGORY_TILES } from "../../data/homepage";
import { SUBCATEGORIES } from "../../data/subcategories";
import SectionHeader from "../../components/ui/SectionHeader";
import { getCatalogue } from "../../server/catalogue";
import styles from "./CategoryDiscovery.module.css";

const plural = (count: number) => `${count} ${count === 1 ? "product" : "products"}`;

/** The four campaign portraits in a staggered row, each with its count and subcategories. */
export default async function CategoryDiscovery() {
  const catalogue = await getCatalogue();
  return (
    <section className={styles.section} aria-labelledby="categories-title">
      <SectionHeader id="categories-title" title="Discover by" emphasis="category" />
      <ul className={styles.grid}>
        {CATEGORY_TILES.map((tile, index) => {
          const products = catalogue.products.filter(
            (product) => product.category === tile.category,
          );
          const subs = SUBCATEGORIES[tile.category].filter((sub) =>
            products.some((product) => product.subcategory === sub.slug),
          );
          return (
            <li key={tile.href} className={styles.tile}>
              <Link href={tile.href} className={styles.image}>
                <Image
                  src={`/images/campaign/${tile.image}.webp`}
                  alt={tile.alt}
                  fill
                  sizes="(max-width: 767px) 50vw, 25vw"
                  quality={85}
                  style={{ objectPosition: tile.focus }}
                />
              </Link>
              <div className={styles.title}>
                <h3>
                  <span className={styles.number}>0{index + 1}</span>
                  <Link href={tile.href}>{tile.label}</Link>
                </h3>
                <span className="text-caption text-muted">{plural(products.length)}</span>
              </div>
              <ul className={styles.subs}>
                {subs.map((sub) => (
                  <li key={sub.slug}>
                    <Link href={`${tile.href}?sub=${sub.slug}`}>{sub.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
