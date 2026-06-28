/*
  src/app/reqlog.ts - request logger plugin
*/

import type { Elysia } from "elysia";
import { logger } from "../infra/logger";

export const requestLogger = (app: Elysia) =>
  app
    .onAfterHandle(({ request, path, set }) => {
      // Doesn't fire on validation error? e.g. malformed POST body?
      logger.info(`${request.method} ${path} ↩ ${set.status ?? 200}`);
    })
    .as("global");
