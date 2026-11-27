import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase";

// APAC membership verification. Spec shared with the APAC developer:
// we send the member to APAC_VERIFY_URL?nonce=…; apacoaches.org checks the
// login + membership and redirects to /api/apac/callback with
// status, member_id, expires, nonce, ts and an HMAC-SHA256 `sig` over
// "v1|status|member_id|expires|nonce|ts" using APAC_SHARED_SECRET.

export const NONCE_COOKIE = "apac_nonce";
export const VERIFICATION_COOKIE = "apac_verification";

// A signed result older than this is rejected.
export const RESULT_MAX_AGE_SECONDS = 300;
// How long a started check may take (login included) before its nonce dies.
export const NONCE_MAX_AGE_SECONDS = 15 * 60;
// How long a confirmed membership stays usable for checkout.
export const VERIFICATION_MAX_AGE_SECONDS = 60 * 60;

export type ApacResult = {
  status: string;
  memberId: string;
  expires: string;
  nonce: string;
  ts: string;
};

export function getSharedSecret(): string {
  const secret = process.env.APAC_SHARED_SECRET;
  if (!secret) throw new Error("Missing APAC_SHARED_SECRET");
  return secret;
}

export function newNonce(): string {
  return randomBytes(16).toString("hex");
}

export function isNonce(value: string | null | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{32}$/.test(value);
}

export function stringToSign(r: ApacResult): string {
  return ["v1", r.status, r.memberId, r.expires, r.nonce, r.ts].join("|");
}

export function signResult(r: ApacResult, secret = getSharedSecret()): string {
  return createHmac("sha256", secret).update(stringToSign(r)).digest("hex");
}

export function isValidSignature(r: ApacResult, sig: string): boolean {
  const expected = Buffer.from(signResult(r));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type MemberVerification = { id: string; memberId: string; expires: string };

// The confirmed membership attached to this browser (verification cookie),
// if it's still usable: active, recent, not spent on a paid order, and its
// member ID not already used by another paid member ticket.
export async function getMemberVerification(
  verificationId: string | undefined
): Promise<MemberVerification | null> {
  if (!verificationId || !/^[0-9a-f-]{36}$/.test(verificationId)) return null;

  const supabase = getSupabaseServerClient();
  const { data: row } = await supabase
    .from("apac_verifications")
    .select("id, status, member_id, member_expires, verified_at, consumed_at")
    .eq("id", verificationId)
    .maybeSingle();

  if (!row || row.status !== "active" || !row.member_id || !row.verified_at || row.consumed_at) {
    return null;
  }
  const ageSeconds = (Date.now() - Date.parse(row.verified_at)) / 1000;
  if (ageSeconds > VERIFICATION_MAX_AGE_SECONDS) return null;
  if (await isMemberIdUsed(row.member_id)) return null;

  return { id: row.id, memberId: row.member_id, expires: row.member_expires ?? "none" };
}

// True if this APAC member ID already has a paid member ticket.
export async function isMemberIdUsed(memberId: string): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("tickets")
    .select("id, orders!inner(payment_status)")
    .eq("is_member", true)
    .eq("member_id", memberId)
    .eq("orders.payment_status", "paid")
    .limit(1);
  return Boolean(data && data.length > 0);
}

// Marks a verification as spent by a paid order (best-effort record).
export async function consumeVerification(verificationId: string, orderId: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("apac_verifications")
    .update({ consumed_at: new Date().toISOString(), order_id: orderId })
    .eq("id", verificationId)
    .is("consumed_at", null);
  if (error) console.error("Failed to mark APAC verification as used", error);
}

// Reads the verification cookie from a raw Request (route handlers).
export function verificationIdFrom(request: Request): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${VERIFICATION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// Payment routes: an order claiming the member price must be exactly one
// ticket, backed by a usable verification. Returns the verification (null if
// the order isn't a member order) or an error message.
export async function checkMemberOrder(
  request: Request,
  tickets: { isMember?: boolean }[]
): Promise<{ verification: MemberVerification | null } | { error: string }> {
  if (!tickets.some((ticket) => ticket.isMember)) return { verification: null };
  if (tickets.length !== 1) return { error: "The APAC member price is for one person only." };

  const verification = await getMemberVerification(verificationIdFrom(request));
  if (!verification) {
    return {
      error:
        "We couldn't confirm your APAC membership, or it has already been used. Please confirm your membership again.",
    };
  }
  return { verification };
}
