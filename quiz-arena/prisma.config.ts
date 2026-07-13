import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL (port 5432) used by Prisma CLI / migrations
    // DATABASE_URL (port 6543, pgbouncer) used at runtime via adapter
    url: env("DIRECT_URL"),
  },
});
