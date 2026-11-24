import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_CLIENT = 8;
// Backstop across all clients: spoofed IP headers must not allow unlimited guessing.
const MAX_FAILURES_GLOBAL = 40;
const GLOBAL_KEY = "__global__";

type Counter = { count: number; resetAt: number };

const failureStore = new Map<string, Counter>();

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 429; error: "unauthorized" | "rate_limited" };

function getClientKey(request: NextRequest) {
  // On Vercel these headers are set by the platform, so the first value is the real client.
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

function getActiveCount(key: string, now: number) {
  const counter = failureStore.get(key);

  if (!counter || counter.resetAt <= now) {
    failureStore.delete(key);
    return 0;
  }

  return counter.count;
}

function recordFailure(key: string, now: number) {
  const count = getActiveCount(key, now);
  const resetAt =
    count === 0 ? now + RATE_LIMIT_WINDOW_MS : failureStore.get(key)!.resetAt;

  failureStore.set(key, { count: count + 1, resetAt });
}

function verifyPassword(password?: string) {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }

  if (!password) return false;

  const expectedBuffer = Buffer.from(expected);
  const passwordBuffer = Buffer.from(password);

  return (
    expectedBuffer.length === passwordBuffer.length &&
    timingSafeEqual(expectedBuffer, passwordBuffer)
  );
}

export function authorizeAdmin(
  request: NextRequest,
  password: string | undefined
): AdminAuthResult {
  const now = Date.now();
  const clientKey = getClientKey(request);

  if (
    getActiveCount(clientKey, now) >= MAX_FAILURES_PER_CLIENT ||
    getActiveCount(GLOBAL_KEY, now) >= MAX_FAILURES_GLOBAL
  ) {
    return { ok: false, status: 429, error: "rate_limited" };
  }

  if (!verifyPassword(password)) {
    recordFailure(clientKey, now);
    recordFailure(GLOBAL_KEY, now);
    return { ok: false, status: 401, error: "unauthorized" };
  }

  failureStore.delete(clientKey);
  return { ok: true };
}
