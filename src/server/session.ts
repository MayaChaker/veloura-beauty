import "server-only";
import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { db } from "../lib/db";

export interface AccountUser {
  id: string;
  name: string;
  email: string;
}

/**
 * The signed-in shopper, read from the session cookie; null for a guest. cache() reads it once
 * per request, however many layouts, pages and metadata ask.
 */
export const getCurrentUser = cache(async (): Promise<AccountUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
});

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

/**
 * The signed-in user when they are an admin, otherwise null. The role is read from the database
 * on every call, not from the cookie, so revoking it takes effect on the next request.
 */
export async function getAdmin(): Promise<AccountUser | null> {
  const user = await getCurrentUser();
  return user && (await isAdmin(user.id)) ? user : null;
}

const isAdmin = cache(async (userId: string) => {
  const record = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
  return record?.role === "Admin";
});

/**
 * generateMetadata for an admin page. Metadata is resolved even when the page then 404s, so a
 * fixed title would tell a customer the page exists: they get the 404's title instead.
 */
export const adminTitle = (title: string) => async (): Promise<Metadata> =>
  (await getAdmin())
    ? { title: { absolute: `${title} | Veloura Admin` } }
    : { title: "Page not found" };

/**
 * Admin pages call this first. A guest is sent to sign in; a signed-in customer gets the
 * ordinary 404, so the admin area does not reveal that it exists.
 */
export async function requireAdmin(path: string): Promise<AccountUser> {
  const user = await requireUser(path);
  if (!(await isAdmin(user.id))) notFound();
  return user;
}
