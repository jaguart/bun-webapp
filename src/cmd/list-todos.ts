/*
  src/cmd/list-todos.ts - list all todos with user

  Usage:
    bun src/cmd/list-todos.ts
*/

import { todos } from "../model/todos";

console.table(todos.all());
