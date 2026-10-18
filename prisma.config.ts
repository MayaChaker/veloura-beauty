// Prisma CLI settings: where the schema and migrations live, and which database to use.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // `prisma generate` only reads the schema, so CI and builds can run it without a database;
  // migrate and seed fail with a clear connection error when DATABASE_URL is missing.
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
