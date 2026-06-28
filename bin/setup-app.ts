#!/usr/bin/env bun
/*
  bin/setup-app.ts - first-run setup after `bun create jaguart/bun-webapp`

  Usage:
    bun run setup
*/

import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { createInterface } from "node:readline";
import { $ } from "bun";

const log = (msg: string) => process.stderr.write(`setup: ${msg}\n`);

function prompt(question: string, fallback = ""): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const hint = fallback ? ` [${fallback}]` : "";
  return new Promise((res) => {
    rl.question(`${question}${hint}: `, (answer) => {
      rl.close();
      res(answer.trim() || fallback);
    });
  });
}

const pkgPath = "package.json";
const pkg = await Bun.file(pkgPath).json();

const defaultName = basename(resolve(".")).toLowerCase().replace(/[^a-z0-9-]/g, "-");

log("bun-webapp setup");
process.stdout.write("\n");

const appName    = await prompt("App name",            pkg.name        || defaultName);
const description = await prompt("Description",        pkg.description || `A ${appName} web app`);
const author     = await prompt("Author (name <email>)", pkg.author    || "");
const homepage   = await prompt("Homepage URL",         pkg.homepage   || "");

pkg.name        = appName;
pkg.version     = "0.0.1";
pkg.description = description;
pkg.author      = author;
pkg.homepage    = homepage;
delete pkg.repository; // fork must set their own

await Bun.write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
log(`Updated package.json — name: ${appName}`);

const envPath = ".env";
if (!existsSync(envPath)) {
  await $`cp .env.example ${envPath}`;
  log("Created .env from .env.example");
} else {
  log(".env already exists — skipped");
}

log("Initializing database...");
await $`bun bin/init-db.ts`;

process.stdout.write(`
Setup complete. Next steps:

  bun bin/seed-user.ts --name "Your Name" --email you@example.com --password secret
  bun run dev

`);
