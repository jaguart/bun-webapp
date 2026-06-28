#!/usr/bin/env bun
/*
  bin/build-app.ts - type-check API and build UI into public/

  Usage:
    bun run build
*/

import { $ } from "bun";
import { logger } from "../src/infra/logger";

logger.system("Type-checking API…");
const tsc = await $`bunx tsc --noEmit`.nothrow();
if (tsc.exitCode !== 0) {
  logger.error("Type check failed");
  process.exit(1);
}
logger.system("Type check passed");

await $`bun bin/build-ui.ts`;
