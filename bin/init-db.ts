#!/usr/bin/env bun
/*
  bin/init-db.ts - create the SQLite folder/file and run all migrations in order

  # Production
  sudo NODE_ENV=production bun run init-db

*/
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { config } from "../src/config";
import { logger } from "../src/infra/logger";

await mkdir(dirname(config.DB_PATH), { recursive: true });
logger.system(`Directory ready: ${dirname(config.DB_PATH)}`);

const migrations = [
  ...new Bun.Glob("src/db/migration-*.ts").scanSync("."),
].sort();

for (const file of migrations) {
  await import(resolve(file));
  logger.system(`Migration applied: ${file}`);
}

logger.system(`Database ready: ${config.DB_PATH} for ${config.appEnv}`);

if (config.appEnv === "development") {
  logger.system(`\nFor production: sudo NODE_ENV=production bun run init-db`);
}
