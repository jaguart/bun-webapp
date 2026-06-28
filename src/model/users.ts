/*
  users collection model
*/

import { store } from "../infra/store";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  capabilities: string;
};

export const users = {
  findByEmail: (email: string): User | null =>
    store
      .query("SELECT * FROM user WHERE email = $email")
      .get({ $email: email }) as User | null,

  create: (
    name: string,
    email: string,
    passwordHash: string,
    capabilities = "",
  ): User => {
    const row = store
      .query(
        "INSERT INTO user (name, email, password_hash, capabilities) VALUES ($name, $email, $hash, $capabilities) RETURNING *",
      )
      .get({
        $name: name,
        $email: email,
        $hash: passwordHash,
        $capabilities: capabilities,
      }) as User;
    return row;
  },

  upsert: (
    name: string,
    email: string,
    passwordHash: string,
    capabilities = "",
  ): User => {
    const row = store
      .query(
        `INSERT INTO user (name, email, password_hash, capabilities)
         VALUES ($name, $email, $hash, $capabilities)
         ON CONFLICT(email) DO UPDATE SET
           name         = excluded.name,
           password_hash = excluded.password_hash,
           capabilities  = excluded.capabilities
         RETURNING *`,
      )
      .get({
        $name: name,
        $email: email,
        $hash: passwordHash,
        $capabilities: capabilities,
      }) as User;
    return row;
  },
};
