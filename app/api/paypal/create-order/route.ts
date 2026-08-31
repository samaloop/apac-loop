import { createOrder } from "@/lib/paypal";
import { getPaymentMethod, calculateTotal } from "@/app/data/fees";

export async function POST(request: Request) {
  const body = (await request.json()) as { method?: string };

  const method = getPaymentMethod(body.method ?? "");
  if (!method || method.provider !== "paypal") {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const basePrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE_USD);
  if (!basePrice) {
    return Response.json({ error: "Ticket price is not configured" }, { status: 500 });
  }

  const total = calculateTotal(method, basePrice).toFixed(2);

  try {
    const orderId = await createOrder(total, "USD");
    return Response.json({ id: orderId });
  } catch (error) {
    console.error("Failed to create PayPal order", error);
    return Response.json({ error: "Failed to create order" }, { status: 502 });
  }
}
