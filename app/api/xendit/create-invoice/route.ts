import { createInvoice } from "@/lib/xendit";
import { registrationOpen } from "@/app/data/registration";
import { getSupabaseServerClient } from "@/lib/supabase";
import { validateTickets, type RegistrationFields } from "@/lib/validation";
import { getPaymentMethod, calculateTotal, type PaymentMethodId } from "@/app/data/fees";
import { getPricingTier, tierPriceFor, sgdToIDR } from "@/app/data/pricing";
import { promoDiscount, type AppliedPromo } from "@/app/data/promo";
import { validatePromoCode } from "@/lib/promo";
import { enforceRateLimit } from "@/lib/rate-limit";
import { event } from "@/app/data/event";
import { getSgdToIdrRate } from "@/lib/fx";
import { checkMemberOrder } from "@/lib/apac";

type CreateInvoiceRequestBody = {
  method?: string;
  tickets?: RegistrationFields[];
  promoCode?: string;
  // The SGD→IDR rate the buyer saw on the form; must match the current rate.
  idrRate?: number;
};

// Best-effort mapping to Xendit's invoice `payment_methods` filter codes, so
// the hosted page opens closer to what the buyer picked on our page. Not
// guaranteed to match Xendit's current accepted values — verify against
// their live API docs; the charged amount below is correct either way.
const XENDIT_METHOD_CODES: Partial<Record<PaymentMethodId, string[]>> = {
  "xendit-va": ["BCA", "BNI", "BRI", "MANDIRI", "PERMATA"],
  "xendit-qris": ["QRIS"],
  "xendit-ewallet": ["OVO", "DANA", "LINKAJA", "SHOPEEPAY"],
  "xendit-card": ["CREDIT_CARD"],
};

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "xendit-create", 10, 60_000);
  if (limited) return limited;

  if (!registrationOpen) {
    return Response.json({ error: "Registration is not open yet" }, { status: 403 });
  }

  const body = (await request.json()) as CreateInvoiceRequestBody;

  const ticketsError = validateTickets(body.tickets);
  if (ticketsError) {
    return Response.json({ error: ticketsError }, { status: 400 });
  }
  const tickets = body.tickets as Required<RegistrationFields>[];
  const buyer = tickets[0];

  // The member price needs a confirmed APAC membership (see lib/apac.ts).
  const memberCheck = await checkMemberOrder(request, tickets);
  if ("error" in memberCheck) {
    return Response.json({ error: memberCheck.error }, { status: 403 });
  }
  const verification = memberCheck.verification;

  const method = getPaymentMethod(body.method ?? "");
  if (!method || method.provider !== "xendit") {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return Response.json({ error: "Xendit payment is not configured" }, { status: 500 });
  }

  // Ticket type is validated (against pricingTiers) by validateTickets above.
  // Member orders were checked against a confirmed APAC membership above; the
  // SGD tier total is converted to IDR with the daily ECB rate (lib/fx.ts).
  const basePriceSGD = tickets.reduce((sum, ticket) => {
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
  const discountSGD = promoDiscount(promo, basePriceSGD);
  // Charge exactly what the buyer saw: if the rate moved since the form loaded,
  // send the new rate back so they can review the updated total first.
  const { rate } = await getSgdToIdrRate();
  if (body.idrRate !== rate) {
    return Response.json({ error: "rate_changed", idrRate: rate }, { status: 409 });
  }
  const discountIDR = sgdToIDR(discountSGD, rate);
  const basePriceIDR = sgdToIDR(basePriceSGD - discountSGD, rate);
  const total = calculateTotal(method, basePriceIDR);

  let invoice;
  try {
    invoice = await createInvoice({
      externalId: `reg-${crypto.randomUUID()}`,
      amount: total,
      payerEmail: buyer.email!.trim(),
      description: `${event.name} registration (${tickets.length} ticket${tickets.length > 1 ? "s" : ""})`,
      successRedirectUrl: `${siteUrl}/register/success`,
      failureRedirectUrl: `${siteUrl}/register`,
      paymentMethods: XENDIT_METHOD_CODES[method.id],
    });
  } catch (error) {
    console.error("Failed to create Xendit invoice", error);
    return Response.json({ error: "Failed to create invoice" }, { status: 502 });
  }

  // Save the order (and its tickets) as "pending" now, keyed by the invoice
  // id, so the webhook only needs to flip payment_status to "paid" and read
  // the tickets already sitting here — no reliance on webhook metadata.
  const supabase = getSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_name: buyer.name!.trim(),
      buyer_email: buyer.email!.trim(),
      buyer_phone: buyer.phone!.trim(),
      quantity: tickets.length,
      amount: total,
      currency: "IDR",
      payment_provider: "xendit",
      payment_status: "pending",
      payment_reference: invoice.id,
      promo_code: promo?.code ?? null,
      discount_amount: discountIDR,
      fx_rate: rate,
      apac_verification_id: verification?.id ?? null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Failed to save pending Xendit order", orderError);
    return Response.json({ error: "Failed to start payment" }, { status: 500 });
  }

  const { error: ticketsInsertError } = await supabase.from("tickets").insert(
    tickets.map((ticket) => ({
      order_id: order.id,
      full_name: ticket.name!.trim(),
      email: ticket.email!.trim(),
      phone: ticket.phone!.trim(),
      country: ticket.country!.trim(),
      company: ticket.company!.trim(),
      ticket_type: ticket.ticketType!.trim(),
      is_member: Boolean(ticket.isMember),
      // The verified APAC member ID, never the one typed in the browser.
      member_id: ticket.isMember ? (verification?.memberId ?? null) : null,
    }))
  );

  if (ticketsInsertError) {
    console.error("Failed to save pending Xendit tickets", ticketsInsertError);
    return Response.json({ error: "Failed to start payment" }, { status: 500 });
  }

  return Response.json({ invoiceUrl: invoice.invoiceUrl });
}
