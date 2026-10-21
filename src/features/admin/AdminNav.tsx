"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inventory2Outlined } from "@mui/icons-material";
import styles from "./admin.module.css";

const LINKS = [{ href: "/admin/orders", label: "Orders", Icon: Inventory2Outlined }];

export default function AdminNav({ toShip }: { toShip: number }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin">
      {LINKS.map(({ href, label, Icon }) => (
        <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>
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
