#!/usr/bin/env bun
/*
  enable-nginx.ts - create nginx/sites-enabled links to src/system/*.nginx

  Usage:
    # On deployment target server
    bun bin/enable-nginx.ts

    # Check the sudo nginx -t output...
    sudo systemctl restart nginx

*/

import { basename, resolve } from "node:path";
import { $ } from "bun";
import { logger } from "../src/infra/logger";

const sites = [...new Bun.Glob("src/system/*.nginx").scanSync(".")].sort();

if (sites.length === 0) {
  logger.error("No nginx sites found matching src/system/*.nginx");
  process.exit(1);
}

for (const site of sites) {
  const absPath = resolve(site);
  const linkPath = `/etc/nginx/sites-enabled/${basename(site)}`;
  await $`sudo ln -sf ${absPath} ${linkPath}`;
  logger.system(`Linked: ${linkPath} → ${absPath}`);
}

await $`sudo nginx -t`;
