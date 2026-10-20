"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Field";
import { signIn, signUp } from "../../lib/authClient";
import styles from "./auth.module.css";

type Mode = "sign-in" | "sign-up";

/** Only paths on this site, so a crafted ?next= cannot send the shopper elsewhere. */
const safeNext = (next: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/profile";

const COPY: Record<Mode, { title: string; submit: string; busy: string }> = {
  "sign-in": { title: "Sign in", submit: "Sign in", busy: "Signing in…" },
  "sign-up": { title: "Create an account", submit: "Create account", busy: "Creating account…" },
};

/** The sign-in and create-account forms: one layout, the name field only when creating. */
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const copy = COPY[mode];

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: failure } =
      mode === "sign-up"
        ? await signUp.email({ name: form.name.trim(), email: form.email, password: form.password })
        : await signIn.email({ email: form.email, password: form.password });
    if (failure) {
      // One message for a wrong email or password: never reveal which accounts exist.
      setError(
        mode === "sign-in"
          ? "The email or password is incorrect."
          : (failure.message ?? "The account could not be created."),
      );
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  };

  const other = mode === "sign-in" ? "sign-up" : "sign-in";
  return (
    <main className={styles.page}>
      <h1 className="text-h3">{copy.title}</h1>
      <form className={styles.form} onSubmit={submit}>
        {mode === "sign-up" && (
          <Input label="Name" autoComplete="name" required maxLength={60} {...field("name")} />
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          required
          maxLength={120}
          {...field("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
          minLength={8}
          maxLength={128}
          hint={mode === "sign-up" ? "At least 8 characters." : undefined}
          {...field("password")}
        />
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Button type="submit" fullWidth disabled={busy}>
          {busy ? copy.busy : copy.submit}
        </Button>
      </form>
      <p className={styles.switch}>
        {mode === "sign-in" ? "New to Veloura? " : "Already have an account? "}
        <Link href={`/${other}${next !== "/profile" ? `?next=${encodeURIComponent(next)}` : ""}`}>
          {COPY[other].title}
        </Link>
      </p>
    </main>
  );
}
