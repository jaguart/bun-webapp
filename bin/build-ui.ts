#!/usr/bin/env bun
/*
  bin/build-ui.ts - builds the active UI flavour into public/
*/
import { $ } from "bun";
import { logger } from "../src/infra/logger";

const pkg = await Bun.file("package.json").json();
const { name, version } = pkg.ui ?? {};

if (!name) {
  logger.error("No ui flavour set — run ui:vue or ui:svelte first");
  process.exit(1);
}

logger.system(`Building UI: ${name} v${version}`);

if (name === "vue") {
  await $`rsync -a --delete src/public-vue3/ public/`;
} else if (name === "svelte") {
  await $`bunx vite build`;
} else {
  logger.error(`Unknown UI flavour: ${name}`);
  process.exit(1);
}
