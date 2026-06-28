/*
  src/cmd/create-todo.ts - seed script: inserts todos from CLI args

  Usage:
    bun src/cmd/create-todo.ts --email user@example.com "Todo 1" "Todo 2"

*/
import { logger } from "../infra/logger";
import { todos } from "../model/todos";
import { users } from "../model/users";

const args = process.argv.slice(2);
const emailIdx = args.indexOf("--email");
if (emailIdx === -1 || !args[emailIdx + 1]) {
  process.stderr.write("Usage: bun src/cmd/create-todo.ts --email <email> <todo> ...\n");
  process.exit(1);
}

const email = args[emailIdx + 1];
const texts = args.filter((_, i) => i !== emailIdx && i !== emailIdx + 1);

const user = users.findByEmail(email);
if (!user) {
  logger.error(`User not found: ${email}`);
  process.exit(1);
}

for (const text of texts) {
  const todo = todos.insert(text, user.id);
  if (!todo) logger.error(`Skipped empty text: "${text}"`);
  else logger.system(`Created todo #${todo.id} for ${user.name}: ${todo.text}`);
}
