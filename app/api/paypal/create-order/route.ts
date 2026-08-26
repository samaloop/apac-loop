import { createOrder } from "@/lib/paypal";

export async function POST() {
  const price = process.env.TICKET_PRICE_USD;
  if (!price) {
    return Response.json({ error: "Ticket price is not configured" }, { status: 500 });
  }

  try {
    const orderId = await createOrder(price, "USD");
    return Response.json({ id: orderId });
  } catch (error) {
    console.error("Failed to create PayPal order", error);
    return Response.json({ error: "Failed to create order" }, { status: 502 });
  }
}
