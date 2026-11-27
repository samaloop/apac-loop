// Make an APAC verification signature by hand, the same way apacoaches.org
// will: HMAC-SHA256 over "v1|status|member_id|expires|nonce|ts".
//
// Usage:
//   node scripts/apac-sign.mjs [--status active] [--member 4821] [--expires 2027-08-31]
//                              [--nonce <32 hex>] [--ts <unix seconds | now>]
//                              [--secret <text> | --env]
//
//   --secret   sign with this secret (default: the public demo secret from the spec)
//   --env      sign with APAC_SHARED_SECRET from .env, and also print a callback URL
//              (run as: node --env-file=.env scripts/apac-sign.mjs --env ...)
//
// Example (matches the spec's first test vector):
//   node scripts/apac-sign.mjs --status active --member 4821 --expires 2027-08-31 \
//     --nonce 8f3a9c1e0b7d4e2f9a6c5b1d0e3f7a2c --ts 1790000000

import { createHmac, randomBytes } from "node:crypto";

const DEMO_SECRET = "demo-secret-for-testing-only-do-not-use";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const useEnv = args.includes("--env");

let secret = opt("secret", DEMO_SECRET);
let secretLabel = secret === DEMO_SECRET ? "demo secret (public, from the spec)" : "secret from --secret";
if (useEnv) {
  secret = process.env.APAC_SHARED_SECRET;
  secretLabel = "APAC_SHARED_SECRET from .env (hidden)";
  if (!secret) {
    console.error("APAC_SHARED_SECRET not set. Run: node --env-file=.env scripts/apac-sign.mjs --env ...");
    process.exit(1);
  }
}

const tsArg = opt("ts", "now");
const fields = {
  status: opt("status", "active"),
  member_id: opt("member", "4821"),
  expires: opt("expires", `${new Date().getFullYear() + 1}-12-31`),
  nonce: opt("nonce", randomBytes(16).toString("hex")),
  ts: tsArg === "now" ? String(Math.floor(Date.now() / 1000)) : tsArg,
};

const stringToSign = ["v1", fields.status, fields.member_id, fields.expires, fields.nonce, fields.ts].join("|");
const sig = createHmac("sha256", secret).update(stringToSign).digest("hex");

console.log(`secret:         ${secretLabel}`);
console.log(`string to sign: ${stringToSign}`);
console.log(`sig:            ${sig}`);

if (useEnv) {
  const url = new URL("/api/apac/callback", process.env.BASE_URL ?? "http://localhost:3000");
  for (const [k, v] of Object.entries(fields)) url.searchParams.set(k, v);
  url.searchParams.set("sig", sig);
  console.log(`callback URL:   ${url}`);
  console.log("\nNote: our callback only accepts this if the nonce came from /api/apac/start");
  console.log("in the same browser (apac_nonce cookie) and ts is under 5 minutes old.");
}
