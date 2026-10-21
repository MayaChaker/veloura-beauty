// Gives an existing account the admin role: `npm run make-admin -- someone@example.com`.
// There is no button for this anywhere on the site: only someone with the database URL can run it.
// Add `--revoke` to make the account a customer again.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const args = process.argv.slice(2);
  const email = args
    .find((arg) => !arg.startsWith("--"))
    ?.trim()
    .toLowerCase();
  if (!email) throw new Error("Usage: npm run make-admin -- <email> [--revoke]");
  const role = args.includes("--revoke") ? "Customer" : "Admin";

  const { count } = await db.user.updateMany({ where: { email }, data: { role } });
  if (!count) throw new Error(`No account uses ${email}. Sign up first, then run this again.`);
  console.log(`${email} is now ${role === "Admin" ? "an admin" : "a customer"}.`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
