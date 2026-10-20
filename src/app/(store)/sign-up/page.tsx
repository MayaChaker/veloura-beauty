import { Suspense } from "react";
import AuthForm from "../../../features/auth/AuthForm";

export const metadata = { title: "Create an Account", robots: { index: false } };

export default function Page() {
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
