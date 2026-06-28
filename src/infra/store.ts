/*
  src/infra/store.ts - database connection
  Light wrapper around bun:sqlite; exposes store instance and Store type.
*/

import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { config } from "../config";
import { logger } from "./logger";

logger.system(`DB: ${config.DB_PATH}`);
if (!existsSync(config.DB_PATH)) {
  logger.info(`New database: ${config.DB_PATH} — maybe: bun run init-db`);
}

export const store = new Database(config.DB_PATH);
export type Store = Database;
