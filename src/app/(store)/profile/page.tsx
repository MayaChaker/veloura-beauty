import AccountShell from "../../../features/account/AccountShell";
import ProfileForm from "../../../features/beauty-profile/ProfileForm";
import { requireUser } from "../../../server/session";

export const metadata = { title: "Beauty Profile", robots: { index: false } };

export default async function Page() {
  const user = await requireUser("/profile");
  return (
    <AccountShell
      user={user}
      current="/profile"
      title="Beauty profile"
      intro="Your skin type and the textures you like. You can change them at any time."
    >
      <ProfileForm />
    </AccountShell>
  );
}
