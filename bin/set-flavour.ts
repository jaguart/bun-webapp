#!/usr/bin/env bun
/*
  bin/set-flavour.ts - stamps a flavour name+version into any package.json field

  Usage:
    bun bin/set-flavour.ts <field> <name> [version]

    If version is omitted, it is read from devDependencies[name] or dependencies[name].

  Examples:
    bun bin/set-flavour.ts ui svelte
    bun bin/set-flavour.ts ui vue 3

*/
import { logger } from "../src/infra/logger";

const [field, name, versionArg] = process.argv.slice(2);
if (!field || !name) {
  logger.error("Usage: bun bin/set-flavour.ts <field> <name> [version]");
  process.exit(1);
}

const pkgPath = "package.json";
const pkg = await Bun.file(pkgPath).json();

const raw = versionArg ?? pkg.devDependencies?.[name] ?? pkg.dependencies?.[name];
const version = raw?.replace(/^[\^~]/, "") ?? "unknown";

pkg[field] = { name, version };
await Bun.write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
logger.system(`${field}: ${name} v${version}`);
