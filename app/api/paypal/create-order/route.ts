import { createOrder } from "@/lib/paypal";
import { getPaymentMethod, calculateTotal } from "@/app/data/fees";
import { getPricingTier, tierPriceFor } from "@/app/data/pricing";
import { validateTickets, type RegistrationFields } from "@/lib/validation";

export async function POST(request: Request) {
  const body = (await request.json()) as { method?: string; tickets?: RegistrationFields[] };

  const ticketsError = validateTickets(body.tickets);
  if (ticketsError) {
    return Response.json({ error: ticketsError }, { status: 400 });
  }
  const tickets = body.tickets as Required<RegistrationFields>[];

  const method = getPaymentMethod(body.method ?? "");
  if (!method || method.provider !== "paypal") {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  // Ticket type is validated (against pricingTiers) by validateTickets above.
  // Member status is self-declared (no membership lookup exists yet), so the
  // member price is applied immediately and reconciled manually later.
  const basePrice = tickets.reduce((sum, ticket) => {
    const tier = getPricingTier(ticket.ticketType);
    return tier ? sum + tierPriceFor(tier, Boolean(ticket.isMember)) : sum;
  }, 0);
  const total = calculateTotal(method, basePrice).toFixed(2);

  try {
    const orderId = await createOrder(total, "USD");
    return Response.json({ id: orderId });
  } catch (error) {
    console.error("Failed to create PayPal order", error);
    return Response.json({ error: "Failed to create order" }, { status: 502 });
  }
}
