/*
  src/api/todos.ts - /api/todos route
*/

import { Elysia, t } from "elysia";
import { StatusCodes } from "http-status-codes";
import { hasCapability } from "../infra/acl";
import { todos } from "../model/todos";
import { guard } from "./guard";

const isAdmin = (capabilities: string) => hasCapability(capabilities, "admin");

export const todoRoutes = new Elysia()
  .use(guard)
  .get("/todos", ({ currentUser }) =>
    todos.all(isAdmin(currentUser.capabilities) ? undefined : currentUser.id),
  )
  .delete(
    "/todos/:id",
    ({ params, currentUser, set }) => {
      const userId = isAdmin(currentUser.capabilities)
        ? undefined
        : currentUser.id;
      const result = todos.delete(params.id, userId);
      set.status =
        result.changes > 0 ? StatusCodes.NO_CONTENT : StatusCodes.NOT_FOUND;
      return null;
    },
    { params: t.Object({ id: t.Numeric() }) },
  )
  .post(
    "/todos",
    ({ body, currentUser, set }) => {
      const todo = todos.insert(body.text, currentUser.id);
      if (!todo) {
        set.status = StatusCodes.UNPROCESSABLE_ENTITY;
        return null;
      }
      return todo;
    },
    { body: t.Object({ text: t.String() }) },
  )
  .patch(
    "/todos/:id/toggle",
    ({ params, currentUser, set }) => {
      const userId = isAdmin(currentUser.capabilities)
        ? undefined
        : currentUser.id;
      const todo = todos.toggleDone(params.id, userId);
      if (!todo) {
        set.status = StatusCodes.NOT_FOUND;
        return null;
      }
      return todo;
    },
    { params: t.Object({ id: t.Numeric() }) },
  );
