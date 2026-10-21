"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeOutlined, Inventory2Outlined, LocalOfferOutlined } from "@mui/icons-material";
import styles from "./admin.module.css";

const LINKS = [
  { href: "/admin", label: "Overview", Icon: HomeOutlined },
  { href: "/admin/orders", label: "Orders", Icon: Inventory2Outlined },
  { href: "/admin/products", label: "Products", Icon: LocalOfferOutlined },
];

/** The overview is current only on /admin itself; every other link also covers its subpages. */
const isCurrent = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname.startsWith(href);

export default function AdminNav({ toShip }: { toShip: number }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin">
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={isCurrent(pathname, href) ? "page" : undefined}>
          <Icon aria-hidden="true" />
          {label}
          {href === "/admin/orders" && toShip > 0 && (
            <span aria-label={`${toShip} to ship`}>{toShip}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
