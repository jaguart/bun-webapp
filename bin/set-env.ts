#!/usr/bin/env bun
/*
  bin/set-env.ts - write NODE_ENV to .env
  Usage: bun bin/set-env.ts <envName>
*/

import { writeFileSync } from "node:fs";

const VALID = ["development", "production"] as const;
type Env = (typeof VALID)[number];

const envName = process.argv[2] as Env;
if (!VALID.includes(envName)) {
  process.stderr.write(`Usage: bun bin/set-env.ts <${VALID.join("|")}>\n`);
  process.exit(1);
}

writeFileSync(".env", `NODE_ENV=${envName}\n`);
process.stderr.write(`NODE_ENV=${envName} written to .env\n`);
