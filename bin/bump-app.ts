#!/usr/bin/env bun
/*
  bin/bump-app.ts - test, bump version, commit+tag, archive to dist/

  Usage:
    bun run bump

  Notes:
    Run after bun run build (ui must be built before archiving).
    Run before bun run deploy.
*/

import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { $ } from "bun";
import { appDate } from "../src/infra/date";
import { logger } from "../src/infra/logger";

type Pkg = { name: string; version: string };

const PROD_EXCLUDES = [
  ".*/",
  "node_modules/",
  "dist/",
  "build/",
  "doc/",
  "test/",
  "var/",
  "src/public-*/",
  ".env",
  ".env.local",
  ".gitignore",
  "biome.json",
  "README.md",
  "vite.config.ts",
];

//------------------------------------------------------------------------------
async function readPkg(path: string): Promise<Pkg> {
  const pkg = (await Bun.file(path).json()) as Pkg;
  if (!/^[\w-]+$/.test(pkg.name)) {
    logger.error(`Invalid app name "${pkg.name}" — must be ^[\\w-]$`);
    process.exit(1);
  }
  return pkg;
}

//------------------------------------------------------------------------------
async function runTests(): Promise<void> {
  logger.system("Running tests…");
  const unit = await $`bun test test/unit`.nothrow();
  const integration =
    await $`bun test --preload ./test/integration/helpers/db.ts test/integration`.nothrow();
  if (unit.exitCode !== 0 || integration.exitCode !== 0) {
    logger.error("Tests failed — aborting bump");
    process.exit(1);
  }
  logger.system("Tests passed");
}

//------------------------------------------------------------------------------
async function bumpVersion(pkgPath: string, pkg: Pkg): Promise<string> {
  let [major, minor, patch] = pkg.version.split(".").map(Number);
  patch += 1;
  if (patch > 99) { patch = 0; minor += 1; }
  if (minor > 99) { minor = 0; major += 1; }
  const newVersion = `${major}.${minor}.${patch}`;
  pkg.version = newVersion;
  await Bun.write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  return newVersion;
}

//------------------------------------------------------------------------------
function promptComment(label: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    const ask = () =>
      rl.question(`${label}: `, (answer) => {
        const trimmed = answer.trim();
        if (trimmed) { rl.close(); resolve(trimmed); } else ask();
      });
    ask();
  });
}

//------------------------------------------------------------------------------
async function commitAndTag(version: string): Promise<void> {
  const comment = await promptComment("Release comment");
  await $`git add -A`;
  await $`git commit -m "${comment}"`;
  await $`git tag -a v${version} -m ${comment}`;
  logger.system(`Tagged v${version}`);
}

//------------------------------------------------------------------------------
async function archive(stageDir: string, appName: string, version: string): Promise<void> {
  await mkdir("dist", { recursive: true });
  const timestamp = appDate.toTimestamp(new Date(), "-");
  const zipPath = join("dist", `${appName}-v${version}-${timestamp}.zip`);
  const zipData = await $`zip -r - .`.cwd(stageDir).arrayBuffer();
  await Bun.write(zipPath, zipData);
  logger.system(`Archive: ${zipPath}`);
}

//------------------------------------------------------------------------------
const pkgPath = "package.json";
const pkg = await readPkg(pkgPath);
const { name: appName, version: oldVersion } = pkg;

await runTests();

const newVersion = await bumpVersion(pkgPath, pkg);
logger.system(`Version: ${oldVersion} → ${newVersion}`);

await commitAndTag(newVersion);

const stageDir = await mkdtemp(join(tmpdir(), "bump-"));
try {
  const excludeArgs = PROD_EXCLUDES.flatMap((e) => ["--exclude", e]);
  await $`rsync -a ${excludeArgs} . ${stageDir}/`;
  await archive(stageDir, appName, newVersion);
} finally {
  await rm(stageDir, { recursive: true, force: true });
}
