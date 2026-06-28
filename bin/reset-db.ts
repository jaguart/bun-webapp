#!/usr/bin/env bun
/*
  bin/reset-db.ts - wipe all table data, then re-run migrations for a pristine DB
  Usage: bun bin/reset-db.ts
*/

import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { config } from "../src/config";
import { logger } from "../src/infra/logger";
import { store } from "../src/infra/store";

// Disable FK checks so we can delete in any order
store.run("PRAGMA foreign_keys = OFF");

const tables = store
  .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all() as { name: string }[];

for (const { name } of tables) {
  store.run(`DELETE FROM "${name}"`);
  logger.system(`Truncated: ${name}`);
}

store.run("PRAGMA foreign_keys = ON");

// Re-run all migrations to ensure structure is current
await mkdir(dirname(config.DB_PATH), { recursive: true });

const migrations = [...new Bun.Glob("src/db/migration-*.ts").scanSync(".")].sort();
for (const file of migrations) {
  await import(resolve(file));
  logger.system(`Migration applied: ${file}`);
}

logger.system("Database reset complete:", config.DB_PATH);
