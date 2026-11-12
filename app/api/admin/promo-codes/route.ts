import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { getSupabaseServerClient } from "@/lib/supabase";
import { generatePromoCodeString } from "@/lib/promo";
import { normalizePromoCode, type PromoDiscountType } from "@/app/data/promo";

const MAX_CODES_PER_BATCH = 100;

type GenerateRequestBody = {
  // Either a single custom code ("APAC2027") or `quantity` random codes,
  // optionally prefixed ("VIP" → "VIP-7KQ2M9XA").
  customCode?: string;
  prefix?: string;
  quantity?: number;
  discountType?: PromoDiscountType;
  discountValue?: number;
  maxUses?: number | null;
  validUntil?: string | null;
  note?: string;
};

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list promo codes", error);
    return Response.json({ error: "Failed to load promo codes" }, { status: 500 });
  }
  return Response.json({ promoCodes: data });
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  const body = (await request.json()) as GenerateRequestBody;

  if (body.discountType !== "percent" && body.discountType !== "fixed") {
    return Response.json({ error: "Choose a discount type" }, { status: 400 });
  }
  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return Response.json({ error: "Discount value must be more than 0" }, { status: 400 });
  }
  if (body.discountType === "percent" && discountValue > 100) {
    return Response.json({ error: "A percentage discount can't exceed 100" }, { status: 400 });
  }

  const maxUses = body.maxUses == null ? null : Math.floor(Number(body.maxUses));
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses < 1)) {
    return Response.json({ error: "Max uses must be at least 1, or left empty" }, { status: 400 });
  }

  let validUntil: string | null = null;
  if (body.validUntil) {
    const date = new Date(body.validUntil);
    if (Number.isNaN(date.getTime())) {
      return Response.json({ error: "Invalid expiry date" }, { status: 400 });
    }
    validUntil = date.toISOString();
  }

  let codes: string[];
  const customCode = normalizePromoCode(body.customCode ?? "");
  if (customCode) {
    if (!/^[A-Z0-9-]{3,32}$/.test(customCode)) {
      return Response.json(
        { error: "Custom code must be 3–32 letters, numbers, or dashes" },
        { status: 400 }
      );
    }
    codes = [customCode];
  } else {
    const quantity = Math.floor(Number(body.quantity ?? 1));
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_CODES_PER_BATCH) {
      return Response.json(
        { error: `Quantity must be between 1 and ${MAX_CODES_PER_BATCH}` },
        { status: 400 }
      );
    }
    codes = Array.from(new Set(
      Array.from({ length: quantity }, () => generatePromoCodeString(body.prefix ?? ""))
    ));
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .insert(
      codes.map((code) => ({
        code,
        discount_type: body.discountType,
        discount_value: discountValue,
        max_uses: maxUses,
        valid_until: validUntil,
        note: body.note?.trim() || null,
      }))
    )
    .select("*");

  if (error) {
    // 23505 = unique_violation: the custom code (or, very rarely, a random one) already exists.
    if (error.code === "23505") {
      return Response.json({ error: "That code already exists — try another" }, { status: 409 });
    }
    console.error("Failed to create promo codes", error);
    return Response.json({ error: "Failed to create promo codes" }, { status: 500 });
  }
  return Response.json({ promoCodes: data });
}

// Turn a code on/off without deleting it (keeps its usage history).
export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedResponse();

  const body = (await request.json()) as { id?: string; active?: boolean };
  if (!body.id || typeof body.active !== "boolean") {
    return Response.json({ error: "Missing id or active" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .update({ active: body.active })
    .eq("id", body.id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to update promo code", error);
    return Response.json({ error: "Failed to update promo code" }, { status: 500 });
  }
  return Response.json({ promoCode: data });
}
