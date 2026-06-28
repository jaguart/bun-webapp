import { beforeEach, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { api } from "../../src/api/api";
import { clearTables, seedUser } from "./helpers/db";

const app = new Elysia().use(api);
const BASE = "http://localhost";

const req = (method: string, path: string, cookie: string | null, body?: unknown) =>
  app.handle(
    new Request(`${BASE}${path}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  );

const login = async (email: string, password: string): Promise<string> => {
  const res = await req("POST", "/api/auth/login", null, { email, password });
  const raw = res.headers.get("set-cookie");
  if (!raw) throw new Error(`Login failed for ${email}: ${res.status}`);
  return raw.split(";")[0].trim();
};

describe("/api/todos — unauthenticated", () => {
  test("GET returns 401", async () => {
    expect((await req("GET", "/api/todos", null)).status).toBe(401);
  });

  test("POST returns 401", async () => {
    expect(
      (await req("POST", "/api/todos", null, { text: "hi" })).status,
    ).toBe(401);
  });
});

describe("/api/todos — regular user", () => {
  let alice: string;
  let bob: string;

  beforeEach(async () => {
    clearTables();
    await seedUser("Alice", "alice@example.com", "pass");
    await seedUser("Bob", "bob@example.com", "pass");
    alice = await login("alice@example.com", "pass");
    bob = await login("bob@example.com", "pass");
  });

  test("GET returns empty list for a new user", async () => {
    const res = await req("GET", "/api/todos", alice);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  test("POST creates a todo and returns it", async () => {
    const res = await req("POST", "/api/todos", alice, { text: "Buy milk" });
    expect(res.status).toBe(200);
    const todo = await res.json();
    expect(todo.text).toBe("Buy milk");
    expect(todo.done).toBe(false);
    expect(todo.userName).toBe("Alice");
  });

  test("POST with blank text returns 422", async () => {
    expect(
      (await req("POST", "/api/todos", alice, { text: "   " })).status,
    ).toBe(422);
  });

  test("GET only returns the current user's own todos", async () => {
    await req("POST", "/api/todos", alice, { text: "Alice's task" });
    await req("POST", "/api/todos", bob, { text: "Bob's task" });

    const todos = await (await req("GET", "/api/todos", alice)).json();
    expect(todos).toHaveLength(1);
    expect(todos[0].text).toBe("Alice's task");
  });

  test("PATCH /toggle flips done state", async () => {
    const { id } = await (
      await req("POST", "/api/todos", alice, { text: "Task" })
    ).json();

    const res = await req("PATCH", `/api/todos/${id}/toggle`, alice);
    expect(res.status).toBe(200);
    expect((await res.json()).done).toBe(true);

    const res2 = await req("PATCH", `/api/todos/${id}/toggle`, alice);
    expect((await res2.json()).done).toBe(false);
  });

  test("PATCH /toggle returns 404 for another user's todo", async () => {
    const { id } = await (
      await req("POST", "/api/todos", alice, { text: "Task" })
    ).json();
    expect((await req("PATCH", `/api/todos/${id}/toggle`, bob)).status).toBe(404);
  });

  test("DELETE removes own todo", async () => {
    const { id } = await (
      await req("POST", "/api/todos", alice, { text: "Task" })
    ).json();
    expect((await req("DELETE", `/api/todos/${id}`, alice)).status).toBe(204);

    const todos = await (await req("GET", "/api/todos", alice)).json();
    expect(todos).toHaveLength(0);
  });

  test("DELETE returns 404 for another user's todo", async () => {
    const { id } = await (
      await req("POST", "/api/todos", alice, { text: "Task" })
    ).json();
    expect((await req("DELETE", `/api/todos/${id}`, bob)).status).toBe(404);
  });
});

describe("/api/todos — admin", () => {
  let admin: string;
  let user: string;

  beforeEach(async () => {
    clearTables();
    await seedUser("Admin", "admin@example.com", "pass", "admin");
    await seedUser("User", "user@example.com", "pass");
    admin = await login("admin@example.com", "pass");
    user = await login("user@example.com", "pass");
  });

  test("GET returns all users' todos", async () => {
    await req("POST", "/api/todos", user, { text: "User's task" });

    const todos = await (await req("GET", "/api/todos", admin)).json();
    expect(todos).toHaveLength(1);
    expect(todos[0].userName).toBe("User");
  });

  test("PATCH /toggle works on any user's todo", async () => {
    const { id } = await (
      await req("POST", "/api/todos", user, { text: "Task" })
    ).json();
    const res = await req("PATCH", `/api/todos/${id}/toggle`, admin);
    expect(res.status).toBe(200);
    expect((await res.json()).done).toBe(true);
  });

  test("DELETE works on any user's todo", async () => {
    const { id } = await (
      await req("POST", "/api/todos", user, { text: "Task" })
    ).json();
    expect((await req("DELETE", `/api/todos/${id}`, admin)).status).toBe(204);
  });
});
