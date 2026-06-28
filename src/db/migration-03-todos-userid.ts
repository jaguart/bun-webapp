/*
  src/db/migration-03-todos-userid.ts - add user_id to todos
*/
import { store } from "../infra/store";

const cols = store.query("PRAGMA table_info(todos)").all() as { name: string }[];
if (!cols.some((c) => c.name === "user_id")) {
  store.run(`ALTER TABLE todos ADD COLUMN user_id INTEGER REFERENCES user(id)`);
}
