/*
  src/app-public.ts - static file serving plugin
*/

import { staticPlugin } from "@elysiajs/static";
import Elysia from "elysia";

export const pub = new Elysia()
  .use(staticPlugin({ assets: "./public", prefix: "/" }))
  .get("/todos", () => Bun.file("./public/index.html"));
