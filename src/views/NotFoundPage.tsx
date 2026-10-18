import Link from "next/link";
import Button from "../components/ui/Button";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <main className={styles.page}>
      <p className="text-label text-muted">Page not found</p>
      <h1 className="text-h3">We couldn’t find that page.</h1>
      <p className={styles.copy}>The link may be out of date, or the page may have moved.</p>
      <div className={styles.actions}>
        <Button href="/shop">Shop all products</Button>
        <Link href="/care/shipping">Customer care</Link>
      </div>
    </main>
  );
}
