import { createInvoice } from "@/lib/xendit";
import { getSupabaseServerClient } from "@/lib/supabase";
import { validateTickets, type RegistrationFields } from "@/lib/validation";
import { getPaymentMethod, calculateTotal, type PaymentMethodId } from "@/app/data/fees";
import { event } from "@/app/data/event";

type CreateInvoiceRequestBody = {
  method?: string;
  tickets?: RegistrationFields[];
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
  const body = (await request.json()) as CreateInvoiceRequestBody;

  const ticketsError = validateTickets(body.tickets);
  if (ticketsError) {
    return Response.json({ error: ticketsError }, { status: 400 });
  }
  const tickets = body.tickets as Required<RegistrationFields>[];
  const buyer = tickets[0];

  const method = getPaymentMethod(body.method ?? "");
  if (!method || method.provider !== "xendit") {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const ticketPrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE_IDR);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!ticketPrice || !siteUrl) {
    return Response.json({ error: "Xendit payment is not configured" }, { status: 500 });
  }

  const total = calculateTotal(method, ticketPrice * tickets.length);

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
    }))
  );

  if (ticketsInsertError) {
    console.error("Failed to save pending Xendit tickets", ticketsInsertError);
    return Response.json({ error: "Failed to start payment" }, { status: 500 });
  }

  return Response.json({ invoiceUrl: invoice.invoiceUrl });
}
