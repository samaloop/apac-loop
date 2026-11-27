import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getPricingTier } from "@/app/data/pricing";
import { NONCE_COOKIE, NONCE_MAX_AGE_SECONDS, newNonce } from "@/lib/apac";

// "Confirm APAC membership": create a one-time nonce, tie it to this browser
// with a cookie, then send the member to the APAC verify page.
export async function GET(request: NextRequest) {
  const limited = enforceRateLimit(request, "apac-start", 10, 60_000);
  if (limited) return limited;

  const verifyUrl = process.env.APAC_VERIFY_URL;
  if (!verifyUrl || !process.env.APAC_SHARED_SECRET) {
    console.error("APAC verification is not configured (APAC_VERIFY_URL / APAC_SHARED_SECRET)");
    return NextResponse.redirect(new URL("/register?member=error", request.url));
  }

  const tier = getPricingTier(request.nextUrl.searchParams.get("tier") ?? "")?.id ?? null;
  const nonce = newNonce();

  const supabase = getSupabaseServerClient();
  // Housekeeping: drop checks that were started but never came back.
  const staleBefore = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await supabase.from("apac_verifications").delete().is("verified_at", null).lt("created_at", staleBefore);

  const { error } = await supabase.from("apac_verifications").insert({ nonce, return_tier: tier });
  if (error) {
    console.error("Failed to start APAC verification", error);
    return NextResponse.redirect(new URL("/register?member=error", request.url));
  }

  const target = new URL(verifyUrl, request.url);
  target.searchParams.set("nonce", nonce);
  const response = NextResponse.redirect(target);
  // Lax: sent on the top-level redirect back from apacoaches.org to our callback.
  response.cookies.set(NONCE_COOKIE, nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: NONCE_MAX_AGE_SECONDS,
  });
  return response;
}
