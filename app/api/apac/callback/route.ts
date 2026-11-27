import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  NONCE_COOKIE,
  NONCE_MAX_AGE_SECONDS,
  RESULT_MAX_AGE_SECONDS,
  VERIFICATION_COOKIE,
  VERIFICATION_MAX_AGE_SECONDS,
  isMemberIdUsed,
  isNonce,
  isValidSignature,
  type ApacResult,
} from "@/lib/apac";

// apacoaches.org sends the member back here with a signed result. Every
// failure ends on /register?member=<reason> with a generic message; details
// go to the server log only.
export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "apac-callback", 20, 60_000);
  if (limited) return limited;

  const p = request.nextUrl.searchParams;
  const result: ApacResult = {
    status: p.get("status") ?? "",
    memberId: p.get("member_id") ?? "",
    expires: p.get("expires") ?? "",
    nonce: p.get("nonce") ?? "",
    ts: p.get("ts") ?? "",
  };
  const sig = p.get("sig") ?? "";

  const finish = (reason: string, tier?: string | null, verificationId?: string) => {
    const url = new URL("/register", request.url);
    if (tier) url.searchParams.set("tier", tier);
    url.searchParams.set("member", reason);
    const response = NextResponse.redirect(url);
    response.cookies.delete(NONCE_COOKIE);
    if (verificationId) {
      response.cookies.set(VERIFICATION_COOKIE, verificationId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: VERIFICATION_MAX_AGE_SECONDS,
      });
    }
    return response;
  };

  // 1. Shape and signature.
  const wellFormed =
    (result.status === "active" || result.status === "inactive") &&
    result.memberId.length > 0 &&
    result.memberId.length <= 60 &&
    !result.memberId.includes("|") &&
    (result.expires === "none" || /^\d{4}-\d{2}-\d{2}$/.test(result.expires)) &&
    isNonce(result.nonce) &&
    /^\d{1,12}$/.test(result.ts) &&
    /^[a-f0-9]{64}$/.test(sig);
  if (!wellFormed) return finish("invalid");

  let signatureOk = false;
  try {
    signatureOk = isValidSignature(result, sig);
  } catch (error) {
    console.error("APAC callback: verification not configured", error);
    return finish("error");
  }
  if (!signatureOk) {
    console.warn("APAC callback: bad signature");
    return finish("invalid");
  }

  // 2. Fresh (allow 60s of clock drift into the future).
  const age = Math.floor(Date.now() / 1000) - Number(result.ts);
  if (age < -60 || age > RESULT_MAX_AGE_SECONDS) return finish("expired");

  // 3. The nonce must belong to this browser.
  if (request.cookies.get(NONCE_COOKIE)?.value !== result.nonce) {
    console.warn("APAC callback: nonce does not match this browser");
    return finish("invalid");
  }

  // 4. Claim the nonce exactly once (atomic: only an unverified, recent row).
  const supabase = getSupabaseServerClient();
  const startedAfter = new Date(Date.now() - NONCE_MAX_AGE_SECONDS * 1000).toISOString();
  const { data: row, error } = await supabase
    .from("apac_verifications")
    .update({
      verified_at: new Date().toISOString(),
      status: result.status,
      member_id: result.memberId,
      member_expires: result.expires,
    })
    .eq("nonce", result.nonce)
    .is("verified_at", null)
    .gt("created_at", startedAfter)
    .select("id, return_tier")
    .maybeSingle();

  if (error) {
    console.error("APAC callback: failed to save result", error);
    return finish("error");
  }
  if (!row) return finish("expired"); // unknown, already used, or too old

  // 5. The membership itself.
  const today = new Date().toISOString().slice(0, 10);
  if (result.status !== "active" || (result.expires !== "none" && result.expires < today)) {
    return finish("inactive", row.return_tier);
  }
  if (await isMemberIdUsed(result.memberId)) {
    return finish("used", row.return_tier);
  }

  return finish("verified", row.return_tier, row.id);
}
