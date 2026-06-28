/*
  src/api/guard.ts - auth guard plugin
  Use via .use(guard) on any route group that requires a logged-in user.
  .as("plugin") propagates derive/resolve types and lifecycle hooks to the consumer.
*/

import { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { type SessionUser, sessions } from "../infra/sessions";

export const guard = new Elysia({ name: "guard" })
  .derive(({ cookie }) => {
    const token =
      (cookie as Record<string, { value?: string }>)?.session?.value ?? null;
    return { currentUser: token ? sessions.findByToken(token) : null };
  })
  .onBeforeHandle(({ currentUser, set }) => {
    if (!currentUser) {
      set.status = StatusCodes.UNAUTHORIZED;
      return { error: "Unauthorized" };
    }
  })
  .resolve(({ currentUser }) => ({ currentUser: currentUser as SessionUser }))
  .as("global");
