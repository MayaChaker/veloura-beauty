import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./SideNavLayout.module.css";

export interface SideNavLink {
  label: string;
  href: string;
}

interface SideNavLayoutProps {
  /** Names the menu for screen readers, e.g. "Customer care". */
  label: string;
  links: SideNavLink[];
  /** Href of the page being shown. */
  current: string;
  /** A short line under the menu. */
  note?: ReactNode;
  children: ReactNode;
}

/** A menu of sibling pages beside the page content: customer care and the account pages. */
export default function SideNavLayout({
  label,
  links,
  current,
  note,
  children,
}: SideNavLayoutProps) {
  return (
    <div className={styles.layout}>
      <aside className={styles.aside}>
        <nav aria-label={label}>
          <ul className={styles.menu}>
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} aria-current={link.href === current ? "page" : undefined}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {note && <p className={styles.note}>{note}</p>}
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
