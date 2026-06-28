/*
  model/todos.ts - todos collection model
  Naming: todos = the collection, todo = a single item
  Note that a Todo aka TodoWithUser is always LEFT JOINED user.
  LEFT JOIN so that orphans appear and let you know there is a problemo.
*/

import { store } from "../infra/store";

export type TodoWithUser = {
  id: number;
  text: string;
  done: boolean;
  userId: number;
  userName: string;
  userEmail: string;
};

// Use 0|1 for true|false
type RawTodoWithUser = Omit<TodoWithUser, "done"> & { done: 0 | 1 };

// I kind of hate the way we have to code for JS naff camelCase vars.
// I would prefer we used the lowercase DB field names directly.
// It feels like the intermediate naming is an anti-pattern.
// We lose the flexibility to say t.*
const SELECT = `
  SELECT t.id, t.text, t.done, t.user_id AS userId, u.name AS userName, u.email AS userEmail
  FROM todos t JOIN user u ON t.user_id = u.id
`;

const coerce = (row: RawTodoWithUser): TodoWithUser => ({
  ...row,
  done: row.done === 1,
});

const byId = (id: number): TodoWithUser | null => {
  const row = store
    .query(`${SELECT} WHERE t.id = $id`)
    .get({ $id: id }) as RawTodoWithUser | null;
  return row ? coerce(row) : null;
};

export const todos = {
  all: (userId?: number): TodoWithUser[] => {
    const rows =
      userId != null
        ? store
            .query(`${SELECT} WHERE t.user_id = $userId ORDER BY t.id`)
            .all({ $userId: userId })
        : store.query(`${SELECT} ORDER BY u.name, t.id`).all();
    return (rows as RawTodoWithUser[]).map(coerce);
  },

  insert: (text: string, userId: number): TodoWithUser | null => {
    if (!text.trim().length) return null;
    const row = store
      .query(
        "INSERT INTO todos (text, done, user_id) VALUES ($text, 0, $userId) RETURNING id",
      )
      .get({ $text: text, $userId: userId }) as { id: number } | null;
    return row ? byId(row.id) : null;
  },

  toggleDone: (id: number, userId?: number): TodoWithUser | null => {
    const result =
      userId != null
        ? store
            .query(
              "UPDATE todos SET done = 1 - done WHERE id = $id AND user_id = $userId",
            )
            .run({ $id: id, $userId: userId })
        : store
            .query("UPDATE todos SET done = 1 - done WHERE id = $id")
            .run({ $id: id });
    return result.changes > 0 ? byId(id) : null;
  },

  delete: (id: number, userId?: number) =>
    userId != null
      ? store
          .query("DELETE FROM todos WHERE id=$id AND user_id=$userId")
          .run({ $id: id, $userId: userId })
      : store.query("DELETE FROM todos WHERE id=$id").run({ $id: id }),
};
