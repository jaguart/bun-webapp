#!/usr/bin/env bun
/*
  bin/list-users.ts - list all users in the database

  Usage:
    bun bin/list-users.ts
*/

import { users } from "../src/model/users";

console.table(users.all());
