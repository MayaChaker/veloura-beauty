"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { updateUser } from "../../lib/authClient";
import styles from "./details.module.css";

/** Changes the name shown on the account and filled in at checkout. */
export default function NameForm({ name }: { name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await updateUser({ name: value.trim() });
    setStatus(error ? "Your name could not be saved. Please try again." : "Saved.");
    setBusy(false);
    if (!error) router.refresh();
  };

  return (
    <form className={styles.form} onSubmit={save}>
      <Input
        label="Name"
        autoComplete="name"
        required
        maxLength={60}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setStatus("");
        }}
      />
      <div className={styles.actions}>
        <Button type="submit" disabled={busy || !value.trim() || value.trim() === name}>
          {busy ? "Saving…" : "Save name"}
        </Button>
        <p role="status">{status}</p>
      </div>
    </form>
  );
}
