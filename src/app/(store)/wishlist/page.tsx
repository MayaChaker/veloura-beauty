import AccountShell from "../../../features/account/AccountShell";
import WishlistGrid from "../../../features/wishlist/WishlistGrid";
import { requireUser } from "../../../server/session";

export const metadata = { title: "Wishlist", robots: { index: false } };

export default async function Page() {
  const user = await requireUser("/wishlist");
  return (
    <AccountShell user={user} current="/wishlist" title="Wishlist">
      <WishlistGrid />
    </AccountShell>
  );
}
