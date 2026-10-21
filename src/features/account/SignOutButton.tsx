"use client";

import { useRouter } from "next/navigation";
import { signOut } from "../../lib/authClient";
import styles from "./accountShell.module.css";

export default function SignOutButton() {
  const router = useRouter();
  const leave = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };
  return (
    <button type="button" className={styles.signOut} onClick={leave}>
      Sign out
    </button>
  );
}
