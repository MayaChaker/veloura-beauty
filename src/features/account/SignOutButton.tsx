"use client";

import { useRouter } from "next/navigation";
import { useCommerce } from "../../hooks/useCommerce";
import { useCustomer } from "../../hooks/useCustomer";
import { signOut } from "../../lib/authClient";
import styles from "./accountShell.module.css";

export default function SignOutButton() {
  const router = useRouter();
  const commerce = useCommerce();
  const customer = useCustomer();
  const leave = async () => {
    const result = await signOut();
    if (result?.error) return;
    // The account keeps its wishlist and profile; this browser forgets them, and the bag, so
    // the next person to use it (or to sign up on it) starts empty.
    commerce.forgetShopper();
    customer.forgetShopper();
    router.push("/");
    router.refresh();
  };
  return (
    <button type="button" className={styles.signOut} onClick={leave}>
      Sign out
    </button>
  );
}
