import Link from "next/link";
import { formatCents } from "../../../domain/orders/receipt";
import { formatOrderDate } from "../../../domain/orders/summary";
import AccountShell from "../../../features/account/AccountShell";
import { OrderThumbs, OrderTrack, StatusPill } from "../../../features/account/OrderParts";
import { ProfileSummary, WishlistPreview } from "../../../features/account/OverviewPanels";
import shell from "../../../features/account/accountShell.module.css";
import orders from "../../../features/account/orders.module.css";
import overview from "../../../features/account/overview.module.css";
import { getSignInMethods } from "../../../server/account";
import { getUserOrders } from "../../../server/orders/getUserOrders";
import { requireUser } from "../../../server/session";

export const metadata = { title: "Your Account", robots: { index: false } };

export default async function Page() {
  const user = await requireUser("/account");
  const [[latest], methods] = await Promise.all([
    getUserOrders(user.id, 1),
    getSignInMethods(user.id),
  ]);
  const firstName = user.name.trim().split(/\s+/)[0] || user.name;

  return (
    <AccountShell
      user={user}
      current="/account"
      title={`Hello, ${firstName}`}
      intro="Your orders, wishlist and beauty profile, on every device."
    >
      <div className={shell.boxes}>
        <section className={`${shell.box} ${shell.wide}`} aria-labelledby="overview-order">
          <div className={shell.boxHead}>
            <h2 id="overview-order">Latest order</h2>
            {latest && <Link href="/orders">All orders</Link>}
          </div>
          {latest ? (
            <>
              <div className={orders.latest}>
                <OrderThumbs images={latest.images} />
                <p>
                  <strong>
                    <Link href={`/checkout/confirmation/${latest.id}`}>{latest.reference}</Link> ·{" "}
                    {formatCents(latest.totalCents)}
                  </strong>
                  <span>
                    Placed {formatOrderDate(latest.placedAt)} · {latest.itemCount}{" "}
                    {latest.itemCount === 1 ? "item" : "items"}
                  </span>
                </p>
                <StatusPill status={latest.status} />
              </div>
              <OrderTrack status={latest.status} />
            </>
          ) : (
            <p className={shell.empty}>
              No orders yet. <Link href="/shop">Start shopping</Link>
            </p>
          )}
        </section>

        <WishlistPreview />
        <ProfileSummary />

        <section className={shell.box} aria-labelledby="overview-details">
          <div className={shell.boxHead}>
            <h2 id="overview-details">Account details</h2>
            <Link href="/account/details">Edit</Link>
          </div>
          <dl className={overview.details}>
            <div>
              <dt>Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Signs in with</dt>
              <dd>{methods.join(" · ")}</dd>
            </div>
          </dl>
        </section>
      </div>
    </AccountShell>
  );
}
