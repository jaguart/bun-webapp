/*
  src/index.ts - bun-webapp main entry-point

  bun run app - run with current .env settings
  bun run dev - run with development settings (updates .env)
  bun run prod - run with production settings (updates .env)

*/

import { Elysia } from "elysia";
import { api } from "./api/api";
import { pub } from "./app/public";
import { requestLogger } from "./app/reqlog";
import { config } from "./config";
import { logger } from "./infra/logger";

const app = new Elysia()
  .use(requestLogger)
  .use(api)
  .use(pub)
  .listen(Number(config.PORT ?? 3000));

logger.system(`ON: ${app.server?.hostname}:${app.server?.port}`);
