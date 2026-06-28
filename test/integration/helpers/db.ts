/*
  test/integration/helpers/db.ts
  Creates an in-memory SQLite DB with the full current schema and mocks
  src/infra/store so all API modules use it instead of the real DB file.

  Loaded via --preload so the mock is in place before test files import
  any API modules.
*/

import { Database } from "bun:sqlite";
import { mock } from "bun:test";

export const testDb = new Database(":memory:");

testDb.run(`
  CREATE TABLE user (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT    NOT NULL,
    email         TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL DEFAULT '',
    capabilities  TEXT NOT NULL DEFAULT ''
  )
`);
testDb.run("CREATE UNIQUE INDEX idx_user_email ON user(email)");
testDb.run(`
  CREATE TABLE sessions (
    token      TEXT    PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES user(id),
    expires_at INTEGER NOT NULL
  )
`);
testDb.run(`
  CREATE TABLE todos (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    text    TEXT    NOT NULL,
    done    INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER REFERENCES user(id)
  )
`);

mock.module("../../../src/infra/store", () => ({ store: testDb }));

export const clearTables = () => {
  testDb.run("DELETE FROM todos");
  testDb.run("DELETE FROM sessions");
  testDb.run("DELETE FROM user");
};

export const seedUser = async (
  name: string,
  email: string,
  password: string,
  capabilities = "",
) => {
  const hash = await Bun.password.hash(password);
  return testDb
    .query(
      `INSERT INTO user (name, email, password_hash, capabilities)
       VALUES ($name, $email, $hash, $capabilities) RETURNING *`,
    )
    .get({
      $name: name,
      $email: email,
      $hash: hash,
      $capabilities: capabilities,
    }) as { id: number; name: string; email: string; capabilities: string };
};
