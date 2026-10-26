import AuthForm from "../../../features/auth/AuthForm";
import { googleSignInEnabled } from "../../../lib/auth";

export const metadata = { title: "Sign In", robots: { index: false } };

export default function Page() {
  return <AuthForm mode="sign-in" google={googleSignInEnabled} />;
}
