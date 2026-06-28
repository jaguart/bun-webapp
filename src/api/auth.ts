/*
  src/app-api-auth.ts - /api/auth routes (login, logout, me)
*/

import { type Elysia, t } from "elysia";
import { StatusCodes } from "http-status-codes";
import { logger } from "../infra/logger";
import { sessions } from "../infra/sessions";
import { users } from "../model/users";

const COOKIE_NAME = "session";
const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
} as const;

export const authRoutes = (app: Elysia) =>
  app
    .post(
      "/auth/login",
      async ({ body, cookie, set }) => {
        const user = users.findByEmail(body.email);
        if (!user) {
          logger.info(`Login failed: no account for ${body.email}`);
          set.status = StatusCodes.UNAUTHORIZED;
          return { error: "Invalid credentials" };
        }
        const valid = await Bun.password.verify(
          body.password,
          user.password_hash,
        );
        if (!valid) {
          logger.info(`Login failed: wrong password for ${body.email}`);
          set.status = StatusCodes.UNAUTHORIZED;
          return { error: "Invalid credentials" };
        }
        logger.info(`Login: ${user.name} <${user.email}>`);
        const token = sessions.create(user.id);
        cookie[COOKIE_NAME].set({ value: token, ...COOKIE_OPTS });
        return {
          name: user.name,
          email: user.email,
          capabilities: user.capabilities,
        };
      },
      { body: t.Object({ email: t.String(), password: t.String() }) },
    )
    .post("/auth/logout", ({ cookie, set }) => {
      const token = cookie[COOKIE_NAME]?.value as string | undefined;
      if (token) sessions.delete(token);
      cookie[COOKIE_NAME].set({ value: "", maxAge: 0, path: "/" });
      set.status = StatusCodes.NO_CONTENT;
      return null;
    })
    .get("/auth/me", ({ cookie, set }) => {
      const token = cookie[COOKIE_NAME]?.value as string | undefined;
      if (!token) {
        set.status = StatusCodes.UNAUTHORIZED;
        return { error: "Not logged in" };
      }
      const user = sessions.findByToken(token);
      if (!user) {
        set.status = StatusCodes.UNAUTHORIZED;
        return { error: "Session expired" };
      }
      return {
        name: user.name,
        email: user.email,
        capabilities: user.capabilities,
      };
    });
