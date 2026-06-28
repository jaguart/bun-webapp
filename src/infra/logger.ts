/*
  src/infra/logger.ts - structured console logger
*/

import { config } from "../config";
import { appDate } from "./date";

const compact = (args: unknown[]) => args.filter((a) => a != null && a !== "");

const log = (...args: unknown[]) =>
  process.stderr.write(
    `${appDate.toLogString()}: ${compact(args).join(" ")}\n`,
  );

// This is one, early - ie first time config and logging are available
log("⛭", "APP:", config.appName, `v${config.appVersion} in ${config.appEnv}`);

export const logger = {
  system: (...args: unknown[]) => log("⛭", ...args), // system information, controller, router etc
  info: (...args: unknown[]) => log("♢", ...args), // Note: sometimes NO embelishment for normal info log lines
  debug: (...args: unknown[]) => log("☆", ...args), // NEXT: make this conditional on an env setting
  error: (...args: unknown[]) => log("✖", ...args),
};
