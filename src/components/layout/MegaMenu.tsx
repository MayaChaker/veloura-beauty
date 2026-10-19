"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION, menuColumns, type MenuItem } from "../../data/navigation";
import { useCatalogue } from "../../hooks/useCatalogue";
import styles from "./MegaMenu.module.css";

/** Category links mark their section; filtered links (New in) never claim the whole shop. */
const isCurrent = (pathname: string, href?: string) =>
  Boolean(href && !href.includes("?") && (pathname === href || pathname.startsWith(`${href}/`)));

/** Leave the panel after choosing a link, so it does not stay open on the next page. */
const releaseFocus = () => (document.activeElement as HTMLElement | null)?.blur();

function Panel({ item }: { item: MenuItem }) {
  const columns = menuColumns(item, useCatalogue());
  if (!columns.length) return null;
  return (
    <div className={styles.panel}>
      <div className={styles.columns}>
        {columns.map((column, index) => (
          <div key={`${column.title}-${index}`}>
            {column.title ? (
              <p className="text-label text-muted">{column.title}</p>
            ) : (
              <span className={styles.spacer} aria-hidden="true" />
            )}
            <ul>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={releaseFocus}>
                    {link.label}
                  </Link>
                  {link.count !== undefined && <span className={styles.count}>{link.count}</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {item.image && item.href && (
          <Link href={item.href} className={styles.feature} onClick={releaseFocus}>
            <span className={styles.featureImage}>
              <Image
                src={`/images/campaign/${item.image}.webp`}
                alt=""
                fill
                sizes="300px"
                quality={85}
              />
            </span>
            <span className={styles.featureLabel}>Shop {item.label.toLowerCase()} →</span>
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Desktop navigation. Hovering or focusing an item opens its panel: subcategories with
 * counts, brands, a Discover column and the category's campaign photograph.
 */
export default function MegaMenu() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Main">
      <ul className={styles.items}>
        {NAVIGATION.map((item) => (
          <li key={item.label} className={styles.item}>
            {item.href ? (
              <Link
                href={item.href}
                className={styles.top}
                aria-current={isCurrent(pathname, item.href) ? "page" : undefined}
                onClick={releaseFocus}
              >
                {item.label}
              </Link>
            ) : (
              <button type="button" className={styles.top}>
                {item.label}
              </button>
            )}
            <Panel item={item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
