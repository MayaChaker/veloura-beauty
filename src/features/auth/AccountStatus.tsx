"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "../../lib/authClient";
import styles from "./AccountStatus.module.css";

/** Who is signed in, with a way out; or an invitation to sign in. */
export default function AccountStatus() {
  const router = useRouter();
  const { data, isPending } = useSession();
  if (isPending) return null;

  if (!data) {
    return (
      <div className={styles.status}>
        <p>Sign in to see your orders on any device.</p>
        <p className={styles.links}>
          <Link href="/sign-in">Sign in</Link>
          <Link href="/sign-up">Create an account</Link>
        </p>
      </div>
    );
  }

  const leave = async () => {
    await signOut();
    router.refresh();
  };
  return (
    <div className={styles.status}>
      <p>
        Signed in as <strong>{data.user.name}</strong>
        <span>{data.user.email}</span>
      </p>
      <button type="button" className={styles.signOut} onClick={leave}>
        Sign out
      </button>
    </div>
  );
}
