/*
  src/db/migration-02-sessions.ts - sessions table
*/
import { store } from "../infra/store";

store.run(
  `CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
  )`,
);
