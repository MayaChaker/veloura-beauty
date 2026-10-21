import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
}

/** The signed-in shopper, read from the session cookie; null for a guest. */
export async function getCurrentUser(): Promise<AccountUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
}

/**
 * The signed-in shopper, or a redirect to sign in that comes back to `path` afterwards.
 * Account pages call this first: who the user is always comes from the session, never from
 * the URL, so nobody can open someone else's account by changing an id.
 */
export async function requireUser(path: string): Promise<AccountUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(path)}`);
  return user;
}
