import type { ReactNode } from "react";
import Breadcrumb from "../../components/ui/Breadcrumb";
import SideNavLayout from "../../components/layout/SideNavLayout";
import styles from "./account.module.css";

const ACCOUNT_LINKS = [
  { label: "Beauty profile", href: "/profile" },
  { label: "Order history", href: "/orders" },
  { label: "Wishlist", href: "/wishlist" },
];

interface AccountLayoutProps {
  title: string;
  /** Href of the page, to mark it in the menu. */
  current: string;
  intro?: ReactNode;
  children: ReactNode;
}

/** The pages saved in this browser (there is no online account), behind one menu. */
export default function AccountLayout({ title, current, intro, children }: AccountLayoutProps) {
  return (
    <main className={styles.page}>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      <SideNavLayout
        label="Your Veloura"
        links={ACCOUNT_LINKS}
        current={current}
        note="Saved in this browser. No account or password needed."
      >
        <header className={styles.head}>
          <h1 className="text-h3">{title}</h1>
          {intro && <p>{intro}</p>}
        </header>
        {children}
      </SideNavLayout>
    </main>
  );
}
