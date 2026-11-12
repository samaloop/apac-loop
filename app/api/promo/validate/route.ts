import { validatePromoCode } from "@/lib/promo";

export async function POST(request: Request) {
  const body = (await request.json()) as { code?: string };
  const result = await validatePromoCode(body.code ?? "");
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ promo: result.promo });
}
