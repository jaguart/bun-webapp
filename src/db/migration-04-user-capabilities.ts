/*
  src/db/migration-04-user-capabilities.ts - add capabilities ACL field to user
*/
import { store } from "../infra/store";

const cols = store.query("PRAGMA table_info(user)").all() as { name: string }[];
if (!cols.some((c) => c.name === "capabilities")) {
  store.run(`ALTER TABLE user ADD COLUMN capabilities TEXT NOT NULL DEFAULT ''`);
}
