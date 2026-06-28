#!/usr/bin/env bun
/*
  enable-systemd.ts - enable and start all system/*.service

  Service name is assumed to be basename(*.service)

  Usage:
    # On deployment target server
    bun bin/enable-systemd.ts

    # emits systemctl status

*/

import { basename, resolve } from "node:path";
import { $ } from "bun";
import { logger } from "../src/infra/logger";

const services = [...new Bun.Glob("src/system/*.service").scanSync(".")].sort();

if (services.length === 0) {
  logger.error("No .service files found: src/system/*.service");
  process.exit(1);
}

for (const service of services) {
  const absPath = resolve(service);
  const svcName = basename(service);
  await $`sudo systemctl link ${absPath}`;
  await $`sudo systemctl enable --now ${svcName}`;
  await $`sudo systemctl status ${svcName}`;
  logger.system(`Service enabled: ${svcName}`);
}
