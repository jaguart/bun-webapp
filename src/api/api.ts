/*
  src/api/api.ts - /api route group
*/

import type { Elysia } from "elysia";
import { StatusCodes } from "http-status-codes";
import { sessions } from "../infra/sessions";
import { authRoutes } from "./auth";
import { metaRoutes } from "./meta";
import { todoRoutes } from "./todos";

const guardedTodos = (app: Elysia) =>
  app
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
    .use(todoRoutes);

export const api = (app: Elysia) =>
  app.group("/api", (app) =>
    app.use(authRoutes).use(metaRoutes).use(guardedTodos),
  );
