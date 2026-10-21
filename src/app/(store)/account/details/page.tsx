import AccountShell from "../../../../features/account/AccountShell";
import NameForm from "../../../../features/account/NameForm";
import styles from "../../../../features/account/details.module.css";
import { getSignInMethods } from "../../../../server/account";
import { requireUser } from "../../../../server/session";

export const metadata = { title: "Account Details", robots: { index: false } };

export default async function Page() {
  const user = await requireUser("/account/details");
  const methods = await getSignInMethods(user.id);
  return (
    <AccountShell user={user} current="/account/details" title="Account details">
      <div className={styles.section}>
        <NameForm name={user.name} />
        <dl className={styles.facts}>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Signs in with</dt>
            <dd>{methods.join(" · ")}</dd>
          </div>
        </dl>
      </div>
    </AccountShell>
  );
}
