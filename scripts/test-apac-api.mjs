// Walks through the APAC membership-verification API step by step, playing
// both the member's browser and apacoaches.org (signing with the shared
// secret, exactly like the WordPress plugin will).
//
// Run with the dev server up:
//   node --env-file=.env scripts/test-apac-api.mjs
// Optional: BASE_URL=http://localhost:3000 (default)

import { createHmac } from "node:crypto";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SECRET = process.env.APAC_SHARED_SECRET;
if (!SECRET) {
  console.error("APAC_SHARED_SECRET is not set. Run with: node --env-file=.env scripts/test-apac-api.mjs");
  process.exit(1);
}

let passed = 0;
let failed = 0;
const check = (label, ok, detail = "") => {
  ok ? passed++ : failed++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
};
const step = (title, explain) => console.log(`\n=== ${title}\n${explain}\n`);

// Reads one cookie value out of a response's Set-Cookie headers.
const cookieFrom = (res, name) => {
  for (const c of res.headers.getSetCookie()) {
    const [pair] = c.split(";");
    const [k, v] = pair.split("=");
    if (k === name) return v;
  }
  return null;
};

// What apacoaches.org does: sign "v1|status|member_id|expires|nonce|ts".
function apacSign({ status, memberId, expires, nonce, ts }) {
  const stringToSign = ["v1", status, memberId, expires, nonce, ts].join("|");
  const sig = createHmac("sha256", SECRET).update(stringToSign).digest("hex");
  return { stringToSign, sig };
}

function callbackUrl(r, sig) {
  const u = new URL("/api/apac/callback", BASE);
  u.searchParams.set("status", r.status);
  u.searchParams.set("member_id", r.memberId);
  u.searchParams.set("expires", r.expires);
  u.searchParams.set("nonce", r.nonce);
  u.searchParams.set("ts", r.ts);
  u.searchParams.set("sig", sig);
  return u;
}

// Step 1 for every scenario: the member clicks "Confirm APAC membership".
async function start() {
  const res = await fetch(new URL("/api/apac/start?tier=early-bird", BASE), { redirect: "manual" });
  const location = res.headers.get("location") ?? "";
  const nonce = new URL(location, BASE).searchParams.get("nonce");
  const cookie = cookieFrom(res, "apac_nonce");
  return { res, location, nonce, cookie };
}

async function callback(url, cookieHeader) {
  const res = await fetch(url, { redirect: "manual", headers: cookieHeader ? { cookie: cookieHeader } : {} });
  const location = res.headers.get("location") ?? "";
  return { res, location, result: new URL(location, BASE).searchParams.get("member") };
}

const now = () => String(Math.floor(Date.now() / 1000));
const nextYear = `${new Date().getFullYear() + 1}-12-31`;

// ---------------------------------------------------------------------------
step(
  "1. Start: GET /api/apac/start?tier=early-bird",
  "Our site creates a random one-time nonce, saves it in Supabase, puts it in an\nhttpOnly cookie (apac_nonce) and redirects the browser to APAC's verify page."
);
const s1 = await start();
console.log(`  HTTP ${s1.res.status} -> ${s1.location}`);
console.log(`  Set-Cookie apac_nonce=${s1.cookie}`);
check("redirects to the verify page with a nonce", s1.res.status === 307 && /^[a-f0-9]{32}$/.test(s1.nonce ?? ""));
check("cookie holds the same nonce", s1.cookie === s1.nonce);

// ---------------------------------------------------------------------------
step(
  "2. APAC signs the result (simulated)",
  "The member logs in on apacoaches.org; their page checks the membership and signs\nthe result with the shared secret. The secret never travels, only the signature."
);
const good = { status: "active", memberId: "4821", expires: nextYear, nonce: s1.nonce, ts: now() };
const g = apacSign(good);
console.log(`  string to sign: ${g.stringToSign}`);
console.log(`  sig:            ${g.sig}`);

// ---------------------------------------------------------------------------
step(
  "3. Callback: GET /api/apac/callback?... (same browser, cookie sent)",
  "Our server re-computes the signature, checks the 5-minute window, that the nonce\nmatches this browser's cookie and was never used, then marks it used and sets the\napac_verification cookie that unlocks the member price."
);
const c1 = await callback(callbackUrl(good, g.sig), `apac_nonce=${s1.cookie}`);
const verificationId = cookieFrom(c1.res, "apac_verification");
console.log(`  HTTP ${c1.res.status} -> ${c1.location}`);
console.log(`  Set-Cookie apac_verification=${verificationId}`);
check("result is verified", c1.result === "verified");
check("verification cookie set", Boolean(verificationId));

// ---------------------------------------------------------------------------
step("4. Replay the same link", "Each nonce works once. Opening the exact same signed link again must fail.");
const c2 = await callback(callbackUrl(good, g.sig), `apac_nonce=${s1.cookie}`);
console.log(`  -> ${c2.location}`);
check("replay rejected", c2.result === "expired");

// ---------------------------------------------------------------------------
step("5. Tampered link", "Change member_id after signing. The signature no longer matches.");
const s5 = await start();
const t = { status: "active", memberId: "4821", expires: nextYear, nonce: s5.nonce, ts: now() };
const tSig = apacSign(t).sig;
const c5 = await callback(callbackUrl({ ...t, memberId: "9999" }, tSig), `apac_nonce=${s5.cookie}`);
console.log(`  -> ${c5.location}`);
check("tampered link rejected", c5.result === "invalid");

// ---------------------------------------------------------------------------
step("6. Old link", "A correctly signed result from 6 minutes ago is past the 5-minute limit.");
const s6 = await start();
const o = { status: "active", memberId: "4821", expires: nextYear, nonce: s6.nonce, ts: String(Number(now()) - 360) };
const c6 = await callback(callbackUrl(o, apacSign(o).sig), `apac_nonce=${s6.cookie}`);
console.log(`  -> ${c6.location}`);
check("old link rejected", c6.result === "expired");

// ---------------------------------------------------------------------------
step(
  "7. Another browser",
  "A valid, fresh, signed link opened without the apac_nonce cookie (someone the\nmember forwarded it to) must fail."
);
const s7 = await start();
const w = { status: "active", memberId: "4821", expires: nextYear, nonce: s7.nonce, ts: now() };
const c7 = await callback(callbackUrl(w, apacSign(w).sig), null);
console.log(`  -> ${c7.location}`);
check("other browser rejected", c7.result === "invalid");

// ---------------------------------------------------------------------------
step("8. Not an active member", "APAC signs status=inactive. Signature is fine, but no member price.");
const s8 = await start();
const i = { status: "inactive", memberId: "5000", expires: "none", nonce: s8.nonce, ts: now() };
const c8 = await callback(callbackUrl(i, apacSign(i).sig), `apac_nonce=${s8.cookie}`);
console.log(`  -> ${c8.location}`);
check("inactive member gets no verification", c8.result === "inactive" && !cookieFrom(c8.res, "apac_verification"));

// ---------------------------------------------------------------------------
step(
  "9. Payment route: POST /api/paypal/create-order with the member price",
  "Without the verification cookie the server refuses the member price; with the cookie\nfrom step 3 it accepts it (this creates a PayPal SANDBOX order, nothing is charged)."
);
const ticket = {
  name: "Test Member",
  email: "test@example.com",
  phone: "+6281200000000",
  country: "Indonesia",
  company: "Test Co",
  ticketType: "early-bird",
  isMember: true,
  memberId: "4821",
};
const order = (cookie) =>
  fetch(new URL("/api/paypal/create-order", BASE), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify({ method: "paypal-account", tickets: [ticket] }),
  });
const p1 = await order(null);
console.log(`  without cookie: HTTP ${p1.status} ${JSON.stringify(await p1.json())}`);
check("member price refused without verification", p1.status === 403);
const p2 = await order(`apac_verification=${verificationId}`);
const p2Body = await p2.json();
console.log(`  with cookie:    HTTP ${p2.status} ${JSON.stringify(p2Body)}`);
check("member price accepted with verification", p2.status === 200 && Boolean(p2Body.id));
const p3 = await fetch(new URL("/api/paypal/create-order", BASE), {
  method: "POST",
  headers: { "Content-Type": "application/json", cookie: `apac_verification=${verificationId}` },
  body: JSON.stringify({ method: "paypal-account", tickets: [ticket, { ...ticket, email: "second@example.com" }] }),
});
console.log(`  two member tickets: HTTP ${p3.status} ${JSON.stringify(await p3.json())}`);
check("member price limited to one person", p3.status === 403);

// ---------------------------------------------------------------------------
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
