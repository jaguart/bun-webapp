/*
  src/infra/sessions.ts - session token management
*/

import { store } from "./store";

const SEVEN_DAYS = 7 * 24 * 60 * 60;

export type SessionUser = { id: number; name: string; email: string; capabilities: string };

export const sessions = {
  create: (userId: number): string => {
    const token = crypto.randomUUID();
    const expiresAt = Math.floor(Date.now() / 1000) + SEVEN_DAYS;
    store
      .query(
        "INSERT INTO sessions (token, user_id, expires_at) VALUES ($token, $userId, $expiresAt)",
      )
      .run({ $token: token, $userId: userId, $expiresAt: expiresAt });
    return token;
  },

  findByToken: (token: string): SessionUser | null => {
    const now = Math.floor(Date.now() / 1000);
    return store
      .query(
        `SELECT u.id, u.name, u.email, u.capabilities
         FROM sessions s JOIN user u ON s.user_id = u.id
         WHERE s.token = $token AND s.expires_at > $now`,
      )
      .get({ $token: token, $now: now }) as SessionUser | null;
  },

  delete: (token: string): void => {
    store.query("DELETE FROM sessions WHERE token = $token").run({ $token: token });
  },
};
