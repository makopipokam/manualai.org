// Shared helpers for the API routes. Files starting with "_" are not exposed as routes.
import { createHash } from "node:crypto";

export const hasOwn = (obj, key) => typeof key === "string" && Object.hasOwn(obj, key);

export const textOf = (response) =>
  response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

export const parseJson = (text) => JSON.parse(String(text).replace(/```json|```/g, "").trim());

// ---------- Usage limits (per visitor and global, per day) ----------
// Uses Upstash Redis if connected in Vercel (KV_REST_API_URL / KV_REST_API_TOKEN
// or UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). Without it, falls back
// to in-memory counting, which is only best-effort on serverless.
const memory = new Map();

async function redisIncr(key) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  // One round trip: increment and (re)set the expiry. The key contains the date, so this is safe.
  const r = await fetch(url.replace(/\/$/, "") + "/pipeline", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([["INCR", key], ["EXPIRE", key, 90000]]),
  });
  if (!r.ok) throw new Error("Redis HTTP " + r.status);
  const out = await r.json();
  if (!Array.isArray(out) || out[0] == null || out[0].error) throw new Error("Redis error");
  return Number(out[0].result);
}

async function count(key) {
  try {
    const n = await redisIncr(key);
    if (n !== null) return n;
  } catch (err) {
    console.error("Limiter store failed, using memory:", err);
  }
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.reset < now) memory.delete(k);
  }
  const e = memory.get(key);
  if (!e || e.reset < now) {
    memory.set(key, { n: 1, reset: now + 86400000 });
    return 1;
  }
  e.n += 1;
  return e.n;
}

const clientIp = (req) =>
  String(
    req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "unknown"
  ).trim();

// Counts one request. The global counter only grows for requests within the personal limit,
// so one blocked visitor cannot use up everybody else's quota.
export async function allowed(req, kind, perVisitor, global, userId) {
  const id = createHash("sha256")
    .update(userId ? "u:" + userId : clientIp(req))
    .digest("hex")
    .slice(0, 16); // no raw IPs or ids stored
  const day = new Date().toISOString().slice(0, 10);
  if ((await count(`rl:${kind}:${day}:${id}`)) > perVisitor) return { ok: false, scope: "user" };
  if ((await count(`rl:${kind}:${day}:all`)) > global) return { ok: false, scope: "global" };
  return { ok: true };
}

// Returns the Supabase user id if the request carries a valid login token.
export async function getUserId(req) {
  const m = String(req.headers.authorization || "").match(/^Bearer (.+)$/);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!m || !url || !key) return null;
  try {
    const r = await fetch(url.replace(/\/$/, "") + "/auth/v1/user", {
      headers: { apikey: key, Authorization: "Bearer " + m[1] },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return typeof u.id === "string" ? u.id : null;
  } catch (err) {
    console.error("Auth check failed:", err);
    return null;
  }
}
