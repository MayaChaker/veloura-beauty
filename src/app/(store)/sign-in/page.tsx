import { Suspense } from "react";
import AuthForm from "../../../features/auth/AuthForm";

export const metadata = { title: "Sign In", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
