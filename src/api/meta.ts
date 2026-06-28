/*
  src/app-api-meta.ts - /api/app-meta route
*/

import type { Elysia } from "elysia";
import { appMeta } from "../app/meta";
import { appDate } from "../infra/date";

export const metaRoutes = (app: Elysia) =>
  app.get("/app-meta", () => {
    const now = new Date();
    return {
      ...appMeta,
      date: appDate.toCCYYMMDD(now),
      time: appDate.toHHMMSS(now),
    };
  });
