"use client";

import Link from "next/link";
import { ExpandMore } from "@mui/icons-material";
import { NAVIGATION, menuColumns } from "../../data/navigation";
import { useCatalogue } from "../../hooks/useCatalogue";
import Drawer from "../ui/Drawer";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** The phone and tablet menu: the same items as the mega-menu, in a left drawer. */
export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  const catalogue = useCatalogue();
  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left">
      <nav aria-label="Main" className={styles.menu}>
        <ul className={styles.items}>
          {NAVIGATION.map((item) => {
            const columns = menuColumns(item, catalogue);
            if (!columns.length && item.href)
              return (
                <li key={item.label}>
                  <Link href={item.href} className={styles.top} onClick={onClose}>
                    {item.label}
                  </Link>
                </li>
              );
            return (
              <li key={item.label}>
                <details className={styles.group}>
                  <summary className={styles.top}>
                    {item.label}
                    <ExpandMore aria-hidden="true" />
                  </summary>
                  {columns.map((column, index) => (
                    <div key={`${column.title}-${index}`} className={styles.column}>
                      {column.title && <p className="text-label text-muted">{column.title}</p>}
                      <ul>
                        {column.links.map((link) => (
                          <li key={link.href}>
                            <Link href={link.href} onClick={onClose}>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </details>
              </li>
            );
          })}
        </ul>
        <ul className={styles.account}>
          <li>
            <Link href="/account" onClick={onClose}>
              Account
            </Link>
          </li>
          <li>
            <Link href="/wishlist" onClick={onClose}>
              Wishlist
            </Link>
          </li>
        </ul>
      </nav>
    </Drawer>
  );
}
