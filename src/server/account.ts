import "server-only";
import { db } from "../lib/db";

/** How a user can sign in: "Email and password", "Google", or both. */
export async function getSignInMethods(userId: string): Promise<string[]> {
  const accounts = await db.account.findMany({ where: { userId }, select: { providerId: true } });
  const labels: Record<string, string> = { credential: "Email and password", google: "Google" };
  return accounts.map((account) => labels[account.providerId] ?? account.providerId);
}
