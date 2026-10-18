import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const createClient = () =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// One client per server process. In development, hot reloads re-run this module, so the client
// is kept on globalThis; otherwise every reload would open a new pool of connections.
const globalForDb = globalThis as unknown as { db?: PrismaClient };

export const db = globalForDb.db ?? createClient();

if (process.env.NODE_ENV !== "production") globalForDb.db = db;
