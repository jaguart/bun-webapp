/*
  App-wide configuration
  usage: import { config } from "./config"

  Bun .env load uses OS-level NODE_ENV - it ignores the NODE_ENV in .env itself.
  This is manual so that project .env with 'NODE_ENV=production' always works.

*/

import { name, version } from "../package.json";

const parseINI = async (path: string): Promise<Record<string, string>> => {
  const file = Bun.file(path);
  if (!(await file.exists())) return {};
  return Object.fromEntries(
    (await file.text())
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("#"))
      .map((l) => l.split("=", 2)),
  );
};

const initial = await parseINI(".env");
const context = initial.NODE_ENV ?? process.env.NODE_ENV ?? "development";
const overlay = await parseINI(`.env.${context}`);
const merged = { ...initial, ...overlay };

const appName = name;
const dbName = context === "development" ? `var/${appName}-dev.sqlite` : `var/${appName}.sqlite`;

const gitStatus = Bun.spawnSync(["git", "status", "--porcelain"], { stderr: "ignore" });
const isDirty = gitStatus.exitCode === 0 && gitStatus.stdout.toString().trim().length > 0;
const appVersion = isDirty ? `${version}-dirty` : version;

export const config = {
  appName,
  appVersion,
  appEnv: context,
  DB_PATH: merged.DB_PATH ?? process.env.DB_PATH ?? dbName,
  PORT: merged.PORT ?? process.env.PORT ?? "3000",
} as const;

process.title = config.appName;
