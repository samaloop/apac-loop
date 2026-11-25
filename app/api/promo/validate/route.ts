import { validatePromoCode } from "@/lib/promo";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "promo-validate", 10, 60_000);
  if (limited) return limited;

  const body = (await request.json()) as { code?: string };
  const result = await validatePromoCode(body.code ?? "");
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ promo: result.promo });
}
