/*
  src/app/meta.ts - server identity snapshot for /api/app-meta

  NOTE THAT THIS INFORMATION IS VISIBLE TO CLIENTS

*/

import { hostname } from "node:os";
import { basename } from "node:path";
import { author, description, homepage, repository, ui } from "../../package.json";
import { config } from "../config";

const { appName, appVersion, appEnv, DB_PATH } = config;

const repoHosts: Record<string, string> = {
  github: "https://github.com",
  gitlab: "https://gitlab.com",
  bitbucket: "https://bitbucket.org",
};

const toRepoUrl = (repo: unknown): string => {
  if (typeof repo !== "string") return "";
  const m = repo.match(/^(\w+):(.+)$/);
  return m && repoHosts[m[1]] ? `${repoHosts[m[1]]}/${m[2]}` : repo;
};

export const appMeta = Object.freeze({
  appName,
  appVersion,
  appEnv,
  appDB: basename(DB_PATH), // Don't leak folders - just basename
  description: description ?? "",
  author: author ?? "",
  homepage: homepage ?? "",
  repository: toRepoUrl(repository),
  ui: ui ?? { name: "Unknown", version: "0" },
  host: hostname(),
});
