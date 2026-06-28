#!/usr/bin/env bun
/*
  bin/deploy-app.ts - stage, rsync to server, install, restart service

  Usage:
    bun run deploy user@server <env>

  Example:
    bun run deploy jeff@myserver production

  Notes:
    Run after bun run bump (version must be committed before deploying).
    You may need: ssh user@host sudo systemctl daemon-reload for *.service changes.
*/

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";
import { logger } from "../src/infra/logger";

type Pkg = { name: string };

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

const VALID_ENVS = ["development", "production"] as const;
type Env = (typeof VALID_ENVS)[number];

//------------------------------------------------------------------------------
async function stageFiles(envName: Env): Promise<string> {
  const stageDir = await mkdtemp(join(tmpdir(), "deploy-"));
  const excludes = [
    ...PROD_EXCLUDES,
    ...VALID_ENVS.filter((e) => e !== envName).map((e) => `.env.${e}`),
  ];
  const excludeArgs = excludes.flatMap((e) => ["--exclude", e]);
  await $`rsync -a ${excludeArgs} . ${stageDir}/`;
  await $`bun bin/set-env.ts ${envName}`.cwd(stageDir);
  logger.system(`.env: NODE_ENV=${envName}`);
  return stageDir;
}

//------------------------------------------------------------------------------
async function syncToServer(stageDir: string, userHost: string, appName: string): Promise<void> {
  const remote = `/srv/${appName}`;
  logger.system(`Deploying to ${userHost}:${remote}/...`);
  await $`rsync -av --delete --exclude=var/ ${stageDir}/ ${userHost}:${remote}/`;
  await $`ssh ${userHost} ${`cd ${remote} && bun install --production`}`;
  await $`ssh ${userHost} sudo systemctl restart ${appName}`;
}

//------------------------------------------------------------------------------
const userHost = process.argv[2];
const envName = process.argv[3] as Env;

if (!userHost || !VALID_ENVS.includes(envName)) {
  logger.error(`Usage: bun bin/deploy-app.ts user@server <${VALID_ENVS.join("|")}>`);
  process.exit(1);
}

const { name: appName } = (await Bun.file("package.json").json()) as Pkg;

const stageDir = await stageFiles(envName);
try {
  await syncToServer(stageDir, userHost, appName);
} finally {
  await rm(stageDir, { recursive: true, force: true });
}
