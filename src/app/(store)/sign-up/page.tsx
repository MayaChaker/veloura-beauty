import AuthForm from "../../../features/auth/AuthForm";
import { googleSignInEnabled } from "../../../lib/auth";

export const metadata = { title: "Create an Account", robots: { index: false } };

export default function Page() {
  return <AuthForm mode="sign-up" google={googleSignInEnabled} />;
}
