/*
  src/db/migration-00-todos.ts - initial schema migration
*/
import { store } from "../infra/store";

store.run(
  `CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0)`,
);
