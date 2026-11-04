import "server-only";
import { randomInt } from "node:crypto";
import { getSupabaseServerClient, type PromoCode } from "@/lib/supabase";
import { normalizePromoCode, type AppliedPromo } from "@/app/data/promo";

export function toAppliedPromo(promo: PromoCode): AppliedPromo {
  return {
    code: promo.code,
    discountType: promo.discount_type,
    discountValue: Number(promo.discount_value),
  };
}

export async function findPromoCode(code: string): Promise<PromoCode | null> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", normalizePromoCode(code))
    .maybeSingle();
  return (data as PromoCode | null) ?? null;
}

// Looks the code up and checks it's still usable right now. max_uses is
// checked against paid orders only (used_count is bumped on payment), so a
// few simultaneous checkouts can push a limited code slightly past its cap.
export async function validatePromoCode(
  code: string
): Promise<{ promo: AppliedPromo } | { error: string }> {
  if (!normalizePromoCode(code)) return { error: "Enter a promo code" };
  const promo = await findPromoCode(code);
  if (!promo || !promo.active) return { error: "This promo code is not valid" };
  if (promo.valid_until && new Date(promo.valid_until).getTime() < Date.now()) {
    return { error: "This promo code has expired" };
  }
  if (promo.max_uses !== null && promo.used_count >= promo.max_uses) {
    return { error: "This promo code has reached its usage limit" };
  }
  return { promo: toAppliedPromo(promo) };
}

// Counts one use — call only once an order is actually paid. Best-effort:
// a failed count must never break a completed purchase.
export async function redeemPromoCode(code: string) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.rpc("redeem_promo_code", { p_code: code });
  if (error) {
    console.error("Failed to count promo code use", code, error);
  }
}

// No 0/O/1/I so codes read unambiguously when typed from a flyer or chat.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const RANDOM_PART_LENGTH = 8;

export function generatePromoCodeString(prefix: string): string {
  let random = "";
  for (let i = 0; i < RANDOM_PART_LENGTH; i++) {
    random += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  const cleanPrefix = normalizePromoCode(prefix).replace(/[^A-Z0-9]/g, "");
  return cleanPrefix ? `${cleanPrefix}-${random}` : random;
}
