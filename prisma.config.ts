// Prisma CLI settings: where the schema and migrations live, and which database to use.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Migrations use Neon's direct connection when it exists (the pooled one cannot hold the lock
  // migrate needs). `prisma generate` only reads the schema, so it works without either.
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
