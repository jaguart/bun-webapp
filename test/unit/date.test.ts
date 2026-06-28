import { describe, expect, test } from "bun:test";
import { appDate } from "../../src/infra/date";

const D = new Date("2026-06-27T13:05:09.000Z");

describe("toLogString", () => {
  test("formats as MM-DD HH:MM:SS in local time", () => {
    // Build expected string using the same local-time logic so the test
    // passes in any timezone.
    const pad = (n: number) => String(n).padStart(2, "0");
    const expected = `${pad(D.getMonth() + 1)}-${pad(D.getDate())} ${pad(D.getHours())}:${pad(D.getMinutes())}:${pad(D.getSeconds())}`;
    expect(appDate.toLogString(D)).toBe(expected);
  });

  test("zero-pads single-digit month, day, hour, minute, second", () => {
    const early = new Date("2026-01-03T04:05:06.000Z");
    const result = appDate.toLogString(early);
    expect(result).toMatch(/^\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});

describe("toCCYYMMDD", () => {
  test("returns 8 digits CCYYMMDD with no separators", () => {
    expect(appDate.toCCYYMMDD(D)).toBe("20260627");
  });

  test("zero-pads month and day", () => {
    expect(appDate.toCCYYMMDD(new Date("2026-01-03T00:00:00.000Z"))).toBe("20260103");
  });
});

describe("toHHMMSS", () => {
  test("formats as HH:MM:SS in local time", () => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const expected = `${pad(D.getHours())}:${pad(D.getMinutes())}:${pad(D.getSeconds())}`;
    expect(appDate.toHHMMSS(D)).toBe(expected);
  });
});

describe("toTimestamp", () => {
  test("returns 14-digit compact timestamp by default", () => {
    const result = appDate.toTimestamp(D);
    expect(result).toMatch(/^\d{14}$/);
    expect(result.slice(0, 8)).toBe("20260627");
  });

  test("inserts separator between date and time parts", () => {
    const result = appDate.toTimestamp(D, "-");
    expect(result).toMatch(/^\d{8}-\d{6}$/);
    expect(result.slice(0, 8)).toBe("20260627");
  });
});
