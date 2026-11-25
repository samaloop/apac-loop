import "server-only";

// A tiny in-memory rate limiter. It counts how many times each visitor (by
// IP) hits a given action inside a time window, and blocks once they go over.
// State lives in this server's memory: fine for the single App Platform
// instance this app runs on. If the app is ever scaled to several instances,
// each keeps its own count, so the effective limit multiplies by the instance
// count — switch to a shared store (e.g. Redis) then.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Drop expired buckets occasionally so the map can't grow forever under an
// attack from many IPs.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

// `key` groups the counter (e.g. "promo:1.2.3.4"). `limit` requests are
// allowed per `windowMs` milliseconds.
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}

// The visitor's real IP. Behind DigitalOcean's Cloudflare edge the trustworthy
// value is `cf-connecting-ip`; `x-forwarded-for` is a fallback for local dev.
export function clientIp(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export function tooManyRequests(retryAfterSeconds: number): Response {
  return Response.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
  );
}

// Convenience: build the key, check the limit, and return a 429 response when
// over the limit (or null when the request may proceed).
export function enforceRateLimit(
  request: Request,
  action: string,
  limit: number,
  windowMs: number
): Response | null {
  const { ok, retryAfterSeconds } = rateLimit(`${action}:${clientIp(request)}`, limit, windowMs);
  return ok ? null : tooManyRequests(retryAfterSeconds);
}
