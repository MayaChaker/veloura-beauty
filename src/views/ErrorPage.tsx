"use client";

import Link from "next/link";
import Button from "../components/ui/Button";
import styles from "./NotFoundPage.module.css";

interface ErrorPageProps {
  /** Next's id for the failure; the server log has the same one, with the details. */
  digest?: string;
  retry: () => void;
  /** Where "or go back" leads: the shop for shoppers, the admin home for admins. */
  home?: { href: string; label: string };
}

/**
 * Shown when a page fails to load. It never shows the error itself (that could leak how the
 * site works), only a reference the support team can look up in the logs.
 */
export default function ErrorPage({
  digest,
  retry,
  home = { href: "/care/shipping", label: "Customer care" },
}: ErrorPageProps) {
  return (
    <main className={styles.page}>
      <p className="text-label text-muted">Something went wrong</p>
      <h1 className="text-h3">This page didn’t load.</h1>
      <p className={styles.copy}>
        The problem is on our side, not yours. Try again, or come back in a few minutes.
        {digest && <> If it keeps happening, mention reference {digest}.</>}
      </p>
      <div className={styles.actions}>
        <Button onClick={retry}>Try again</Button>
        <Link href={home.href}>{home.label}</Link>
      </div>
    </main>
  );
}
