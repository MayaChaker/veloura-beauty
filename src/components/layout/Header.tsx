"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FavoriteBorder, PersonOutline, ShoppingBagOutlined } from "@mui/icons-material";
import { FREE_SHIPPING_THRESHOLD } from "../../domain/commerce/commerceConfig";
import { useCartDrawer } from "../../hooks/useCartDrawer";
import { useCommerce } from "../../hooks/useCommerce";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import SearchBar from "./SearchBar";
import styles from "./Header.module.css";

const itemCount = (count: number) => `${count} ${count === 1 ? "item" : "items"}`;

export default function Header() {
  const { cart, wishlist } = useCommerce();
  const { openCart } = useCartDrawer();
  const pathname = usePathname();
  // The menu remembers the page it was opened on, so navigating closes it without an effect.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <>
      <div className={styles.announcement} role="region" aria-label="Store announcements">
        <p>Complimentary delivery on orders over ${FREE_SHIPPING_THRESHOLD}</p>
        <p>Free returns within 30 days</p>
      </div>
      <header className={styles.header}>
        <div className={styles.bar}>
          <button
            type="button"
            className={`${styles.icon} ${styles.menuButton}`}
            onClick={() => setMenuPath(pathname)}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.5 8h17M3.5 16h17" />
            </svg>
          </button>
          <Link href="/" className={styles.logo} aria-label="Veloura, home">
            VELOURA
          </Link>
          <div className={styles.nav}>
            <MegaMenu />
          </div>
          <div className={styles.tools}>
            <div className={styles.search}>
              <SearchBar />
            </div>
            <Link
              href="/account"
              className={`${styles.icon} ${styles.desktopOnly}`}
              aria-label="Account"
            >
              <PersonOutline aria-hidden="true" />
            </Link>
            <Link
              href="/wishlist"
              className={`${styles.icon} ${styles.desktopOnly}`}
              aria-label={`Wishlist, ${itemCount(wishlist.length)}`}
            >
              <FavoriteBorder aria-hidden="true" />
              {wishlist.length > 0 && <span className={styles.count}>{wishlist.length}</span>}
            </Link>
            <button
              type="button"
              className={styles.icon}
              onClick={openCart}
              aria-label={`Bag, ${itemCount(cartCount)}`}
            >
              <ShoppingBagOutlined aria-hidden="true" />
              {cartCount > 0 && <span className={styles.count}>{cartCount}</span>}
            </button>
          </div>
        </div>
        <div className={styles.mobileSearch}>
          <SearchBar id="mobileSearch" />
        </div>
      </header>
      <MobileMenu open={menuPath === pathname} onClose={() => setMenuPath(null)} />
    </>
  );
}
