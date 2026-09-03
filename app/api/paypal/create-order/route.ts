import { createOrder } from "@/lib/paypal";
import { getPaymentMethod, calculateTotal } from "@/app/data/fees";
import { validateTickets, type RegistrationFields } from "@/lib/validation";

export async function POST(request: Request) {
  const body = (await request.json()) as { method?: string; tickets?: RegistrationFields[] };

  const ticketsError = validateTickets(body.tickets);
  if (ticketsError) {
    return Response.json({ error: ticketsError }, { status: 400 });
  }
  const tickets = body.tickets as RegistrationFields[];

  const method = getPaymentMethod(body.method ?? "");
  if (!method || method.provider !== "paypal") {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const ticketPrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE_USD);
  if (!ticketPrice) {
    return Response.json({ error: "Ticket price is not configured" }, { status: 500 });
  }

  const quantity = tickets.length;  
  const total = calculateTotal(method, ticketPrice * quantity).toFixed(2);

  try {
    const orderId = await createOrder(total, "USD");
    return Response.json({ id: orderId });
  } catch (error) {
    console.error("Failed to create PayPal order", error);
    return Response.json({ error: "Failed to create order" }, { status: 502 });
  }
}
