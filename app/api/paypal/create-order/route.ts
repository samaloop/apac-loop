import { createOrder } from "@/lib/paypal";
import { registrationOpen } from "@/app/data/registration";
import { getPaymentMethod, calculateTotal } from "@/app/data/fees";
import { getPricingTier, tierPriceFor } from "@/app/data/pricing";
import { promoDiscount, type AppliedPromo } from "@/app/data/promo";
import { validatePromoCode } from "@/lib/promo";
import { validateTickets, type RegistrationFields } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { checkMemberOrder } from "@/lib/apac";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "paypal-create", 10, 60_000);
  if (limited) return limited;

  if (!registrationOpen) {
    return Response.json({ error: "Registration is not open yet" }, { status: 403 });
  }

  const body = (await request.json()) as {
    method?: string;
    tickets?: RegistrationFields[];
    promoCode?: string;
  };

  const ticketsError = validateTickets(body.tickets);
  if (ticketsError) {
    return Response.json({ error: ticketsError }, { status: 400 });
  }
  const tickets = body.tickets as Required<RegistrationFields>[];

  // The member price needs a confirmed APAC membership (see lib/apac.ts).
  const memberCheck = await checkMemberOrder(request, tickets);
  if ("error" in memberCheck) {
    return Response.json({ error: memberCheck.error }, { status: 403 });
  }

  const method = getPaymentMethod(body.method ?? "");
  if (!method || method.provider !== "paypal") {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  // Ticket type is validated (against pricingTiers) by validateTickets above.
  // Member orders were checked against a confirmed APAC membership above.
  const basePrice = tickets.reduce((sum, ticket) => {
    const tier = getPricingTier(ticket.ticketType);
    return tier ? sum + tierPriceFor(tier, Boolean(ticket.isMember)) : sum;
  }, 0);

  let promo: AppliedPromo | null = null;
  if (body.promoCode?.trim()) {
    const promoResult = await validatePromoCode(body.promoCode);
    if ("error" in promoResult) {
      return Response.json({ error: promoResult.error }, { status: 400 });
    }
    promo = promoResult.promo;
  }
  // basePrice is in SGD (the base currency) and PayPal is charged in SGD, so
  // the discounted subtotal goes straight to the fee/total with no conversion.
  const discountedBaseSGD = basePrice - promoDiscount(promo, basePrice);
  const total = calculateTotal(method, discountedBaseSGD).toFixed(2);

  try {
    const orderId = await createOrder(total, "SGD", promo?.code);
    return Response.json({ id: orderId });
  } catch (error) {
    console.error("Failed to create PayPal order", error);
    return Response.json({ error: "Failed to create order" }, { status: 502 });
  }
}
