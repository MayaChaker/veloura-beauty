import type { ReactNode } from "react";
import SideNavLayout from "../../components/layout/SideNavLayout";
import type { AccountUser } from "../../server/session";
import SignOutButton from "./SignOutButton";
import styles from "./accountShell.module.css";

const ACCOUNT_LINKS = [
  { label: "Overview", href: "/account" },
  { label: "Orders", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Beauty profile", href: "/profile" },
  { label: "Account details", href: "/account/details" },
];

interface AccountShellProps {
  /** isAdmin comes from the server (requireUser), so the link is never sent to a customer. */
  user: AccountUser & { isAdmin?: boolean };
  /** Href of the page, to mark it in the menu. */
  current: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}

/** Every account page: who is signed in and the account menu, beside the page. */
export default function AccountShell({ user, current, title, intro, children }: AccountShellProps) {
  return (
    <main className={styles.page}>
      <SideNavLayout
        label="Your account"
        links={
          user.isAdmin ? [...ACCOUNT_LINKS, { label: "Admin", href: "/admin" }] : ACCOUNT_LINKS
        }
        current={current}
        header={
          <div className={styles.me}>
            <span className={styles.avatar} aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase() || "V"}
            </span>
            <p>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </p>
          </div>
        }
        note={<SignOutButton />}
      >
        <header className={styles.head}>
          <p className="text-label text-muted">Your account</p>
          <h1 className="text-h2">{title}</h1>
          {intro && <p className={styles.intro}>{intro}</p>}
        </header>
        {children}
      </SideNavLayout>
    </main>
  );
}
