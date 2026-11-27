import { type NextRequest } from "next/server";
import { isNonce, signResult, type ApacResult } from "@/lib/apac";

// TEST ONLY: stands in for apacoaches.org/conference-verify/ so the whole
// flow can be tried before APAC's page exists. Enabled only when
// APAC_MOCK_VERIFY=true and never in production.
export async function GET(request: NextRequest) {
  if (process.env.APAC_MOCK_VERIFY !== "true" || process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const nonce = request.nextUrl.searchParams.get("nonce");
  if (!isNonce(nonce)) {
    return new Response("Invalid verification request.", { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const callback = new URL("/api/apac/callback", request.url);
  const link = (r: ApacResult, opts: { tamper?: boolean } = {}) => {
    const sig = signResult(r);
    const url = new URL(callback);
    url.searchParams.set("status", r.status);
    url.searchParams.set("member_id", opts.tamper ? `${r.memberId}9` : r.memberId);
    url.searchParams.set("expires", r.expires);
    url.searchParams.set("nonce", r.nonce);
    url.searchParams.set("ts", r.ts);
    url.searchParams.set("sig", sig);
    return url.toString();
  };

  const nextYear = `${new Date().getFullYear() + 1}-12-31`;
  const cases = [
    { label: "Active member", note: "Member ID 4821, expires " + nextYear, href: link({ status: "active", memberId: "4821", expires: nextYear, nonce, ts: String(now) }) },
    { label: "Active, no expiry", note: "Member ID 4823, lifetime", href: link({ status: "active", memberId: "4823", expires: "none", nonce, ts: String(now) }) },
    { label: "Expired member", note: "status=inactive", href: link({ status: "inactive", memberId: "4822", expires: "2025-01-31", nonce, ts: String(now) }) },
    { label: "Not a member", note: "status=inactive, no expiry", href: link({ status: "inactive", memberId: "5000", expires: "none", nonce, ts: String(now) }) },
    { label: "Tampered link", note: "member_id changed after signing", href: link({ status: "active", memberId: "4821", expires: nextYear, nonce, ts: String(now) }, { tamper: true }) },
    { label: "Old link", note: "signed 6 minutes ago", href: link({ status: "active", memberId: "4821", expires: nextYear, nonce, ts: String(now - 360) }) },
  ];

  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Mock APAC verify</title></head>
<body style="margin:0; font-family:Arial, sans-serif; background:#fffaef; color:#24324a;">
  <div style="max-width:520px; margin:0 auto; padding:32px 20px;">
    <p style="margin:0 0 8px; font-size:12px; font-weight:bold; letter-spacing:1px; color:#ff5b5b;">TEST MODE · NOT THE REAL APAC SITE</p>
    <h1 style="margin:0 0 8px; font-size:24px; color:#003f85;">Confirm your APAC membership</h1>
    <p style="margin:0 0 24px; font-size:15px; line-height:1.5;">This page pretends to be apacoaches.org after login. Pick the result to send back to the conference site.</p>
    ${cases
      .map(
        (c) => `<a href="${esc(c.href)}" style="display:block; margin:0 0 12px; padding:14px 16px; border:2px solid #003f85; background:#fff; color:#003f85; text-decoration:none;"><strong style="font-size:16px;">${esc(c.label)}</strong><br /><span style="font-size:13px; color:#717171;">${esc(c.note)}</span></a>`
      )
      .join("")}
    <p style="margin:24px 0 0; font-size:12px; color:#717171;">Nonce: ${esc(nonce)}</p>
  </div>
</body></html>`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
