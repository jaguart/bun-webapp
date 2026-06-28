### Structure

```
# Typescript
src/index.ts    - main entry point
src/config.ts   - global config bag
src/infra/*     - app infra e.g. store
src/model/*     - data entities

# Public Assets
public/

# Storage
var/

# Documentation
doc/

```

### Paths
```
config.ts
what are imports relative to?

Relative to the file doing the importing. So from src/model/todos.ts:

From src/model/todos.ts
import { config } from "../config"    // goes up to src/, finds config.ts
import { db } from "../infra/store"   // goes up to src/, down into infra/

From src/index.ts:
import { config } from "./config"       // same directory
import { todos }  from "./model/todos"  // model subfolder

Options to set paths or the root of the imports?
Yes — tsconfig.json paths and baseUrl:

{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@config": ["config.ts"],
      "@model/*": ["model/*"],
      "@infra/*": ["infra/*"]
    }
  }
}

Then anywhere in the project:

import { Config } from "@config"
import { todos } from "@model/todos"
import { db } from "@infra/store"

Bun supports this natively without any extra tooling.

The trade-off is keeping paths in sync as you add — some peep find the ../ chains less maintenance.
```
## Capitalisation

Lowercase with hyphens is the modern convention for docs you'll process programmatically:

```
doc/
  architecture.md
  design-decisions.md
  api.md
  data-model.md
```

Exceptions that stay uppercase by strong convention: **README.md, CHANGELOG.md, LICENSE.md, CONTRIBUTING.md** — these are "repo-level" files that GitHub and tooling look for by name.

For design decision records specifically, a common pattern is ADR (Architecture Decision Record) with a number prefix so they sort chronologically and are never edited once written:

```
doc/
  adr/
    0001-use-sqlite.md
    0002-repository-pattern.md
    0003-bun-elysia-stack.md
```

Each ADR is immutable — if you change your mind, you write a new one that supersedes the old. Good for long-term traceability. If you plan to generate docs from these, the numbered prefix + consistent structure makes parsing straightforward.

## Evolution: Svelte5

Woohoo - Claude has set me up for Vue or Svelte UI development.

```
bun run ui:svelte   # set flavour to svelte + build

bun run ui:build    # rebuild whichever flavour is currently set
bun run deploy      # ui:build then deploy
```

Actively working on the Svelte version now - vue3 is in ``src/public-vue3`` and build is a simple rsync to ``./public``
