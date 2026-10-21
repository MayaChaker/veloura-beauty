import type { ReactNode } from "react";
import Link from "next/link";
import type { AccountUser } from "../../server/session";
import AdminNav from "./AdminNav";
import styles from "./admin.module.css";

interface AdminShellProps {
  admin: AccountUser;
  /** Orders waiting to be shipped, shown on the Orders link. */
  toShip: number;
  children: ReactNode;
}

/** The admin tool's frame: a dark sidebar with the menu, beside the page. */
export default function AdminShell({ admin, toShip, children }: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <Link href="/admin" className={styles.logo}>
          Veloura<small>Admin</small>
        </Link>
        <AdminNav toShip={toShip} />
        <div className={styles.foot}>
          <span className={styles.me}>
            <i aria-hidden="true">{admin.name.trim().charAt(0).toUpperCase() || "V"}</i>
            {admin.name}
          </span>
          <Link href="/">View store</Link>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
