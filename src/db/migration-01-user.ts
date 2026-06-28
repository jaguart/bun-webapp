/*
  src/db/migration-01-user.ts - user table
*/
import { store } from "../infra/store";

store.run(
  `CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`,
);

const cols = store.query("PRAGMA table_info(user)").all() as { name: string }[];
const has = (col: string) => cols.some((c) => c.name === col);

if (!has("email")) {
  store.run(`ALTER TABLE user ADD COLUMN email TEXT NOT NULL DEFAULT ''`);
}
if (!has("password_hash")) {
  store.run(`ALTER TABLE user ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''`);
}

store.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON user(email)`);
