#!/usr/bin/env bun
/*
  create.ts — executed by `bun create` after the template is applied.
  Also callable manually via: bun run setup
*/
import { $ } from "bun";
await $`bun bin/setup-app.ts`;
