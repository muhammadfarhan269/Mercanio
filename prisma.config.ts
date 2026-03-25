// Load .env then .env.local so Prisma CLI / Studio match Next.js env resolution.
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "prisma/config";
import { normalizePgConnectionString } from "./src/lib/normalize-pg-connection-string";

loadEnv({ path: resolve(process.cwd(), ".env") });
loadEnv({ path: resolve(process.cwd(), ".env.local"), override: true });

// Prefer DIRECT_URL for schema engine (db push, Studio introspection, migrate).
// On Neon, use the non-pooler "direct" host for DIRECT_URL; pooler URLs often break introspection.
const rawDatabaseUrl =
  process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
const databaseUrl = rawDatabaseUrl
  ? normalizePgConnectionString(rawDatabaseUrl)
  : undefined;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
