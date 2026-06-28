#!/usr/bin/env bun
/*
  bin/seed-user.ts - create or update a user account (upsert on email)
  Usage: bun bin/seed-user.ts --name "Jeff" --email jeff@example.com --password secret [--capabilities admin]
*/

import { logger } from "../src/infra/logger";
import { users } from "../src/model/users";

const args = process.argv.slice(2);
const get = (flag: string) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const name = get("--name");
const email = get("--email");
const password = get("--password");
const capabilities = get("--capabilities") ?? "";

if (!name || !email || !password) {
  logger.error("Usage: bun bin/seed-user.ts --name <name> --email <email> --password <password> [--capabilities <caps>]");
  process.exit(1);
}

const existing = users.findByEmail(email);
const passwordHash = await Bun.password.hash(password);
const user = users.upsert(name, email, passwordHash, capabilities);

logger.system(`${existing ? "Updated" : "Created"} user: ${user.name} <${user.email}> capabilities="${user.capabilities}" (id=${user.id})`);
