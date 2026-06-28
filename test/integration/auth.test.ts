import { beforeEach, describe, expect, test } from "bun:test";
import { Elysia } from "elysia";
import { api } from "../../src/api/api";
import { clearTables, seedUser } from "./helpers/db";

const app = new Elysia().use(api);
const BASE = "http://localhost";

const post = (path: string, body: unknown, cookie?: string) =>
  app.handle(
    new Request(`${BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    }),
  );

const get = (path: string, cookie?: string) =>
  app.handle(
    new Request(`${BASE}${path}`, {
      headers: cookie ? { Cookie: cookie } : {},
    }),
  );

const sessionCookie = (res: Response): string => {
  const raw = res.headers.get("set-cookie");
  if (!raw) throw new Error("No set-cookie header in response");
  return raw.split(";")[0].trim();
};

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    clearTables();
    await seedUser("Alice", "alice@example.com", "password123");
  });

  test("returns 200 and user data for valid credentials", async () => {
    const res = await post("/api/auth/login", {
      email: "alice@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe("Alice");
    expect(data.email).toBe("alice@example.com");
    expect(typeof data.capabilities).toBe("string");
  });

  test("sets a session cookie on success", async () => {
    const res = await post("/api/auth/login", {
      email: "alice@example.com",
      password: "password123",
    });
    expect(sessionCookie(res)).toMatch(/^session=.+/);
  });

  test("returns 401 for wrong password", async () => {
    const res = await post("/api/auth/login", {
      email: "alice@example.com",
      password: "wrong",
    });
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("Invalid credentials");
  });

  test("returns 401 for unknown email", async () => {
    const res = await post("/api/auth/login", {
      email: "nobody@example.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
  });

  test("returns 422 for missing password field", async () => {
    const res = await post("/api/auth/login", { email: "alice@example.com" });
    expect(res.status).toBe(422);
  });
});

describe("GET /api/auth/me", () => {
  let cookie: string;

  beforeEach(async () => {
    clearTables();
    await seedUser("Alice", "alice@example.com", "password123");
    cookie = sessionCookie(
      await post("/api/auth/login", {
        email: "alice@example.com",
        password: "password123",
      }),
    );
  });

  test("returns 401 without a cookie", async () => {
    expect((await get("/api/auth/me")).status).toBe(401);
  });

  test("returns user info with a valid session", async () => {
    const res = await get("/api/auth/me", cookie);
    expect(res.status).toBe(200);
    expect((await res.json()).email).toBe("alice@example.com");
  });
});

describe("POST /api/auth/logout", () => {
  test("returns 204 and invalidates the session", async () => {
    clearTables();
    await seedUser("Alice", "alice@example.com", "password123");
    const cookie = sessionCookie(
      await post("/api/auth/login", {
        email: "alice@example.com",
        password: "password123",
      }),
    );

    const logoutRes = await app.handle(
      new Request(`${BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Cookie: cookie },
      }),
    );
    expect(logoutRes.status).toBe(204);
    expect((await get("/api/auth/me", cookie)).status).toBe(401);
  });
});
