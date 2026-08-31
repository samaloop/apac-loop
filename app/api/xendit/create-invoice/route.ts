import { createInvoice } from "@/lib/xendit";
import { getSupabaseServerClient } from "@/lib/supabase";
import { validateRegistrationFields } from "@/lib/validation";
import { getPaymentMethod, calculateTotal, type PaymentMethodId } from "@/app/data/fees";
import { event } from "@/app/data/event";

type CreateInvoiceRequestBody = {
  method?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  company?: string;
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

  const validationError = validateRegistrationFields(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const method = getPaymentMethod(body.method ?? "");
  if (!method || method.provider !== "xendit") {
    return Response.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const { name, email, phone, country, company } = body as Required<
    Omit<CreateInvoiceRequestBody, "method">
  >;

  const basePrice = Number(process.env.NEXT_PUBLIC_TICKET_PRICE_IDR);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!basePrice || !siteUrl) {
    return Response.json({ error: "Xendit payment is not configured" }, { status: 500 });
  }

  const total = calculateTotal(method, basePrice);

  let invoice;
  try {
    invoice = await createInvoice({
      externalId: `reg-${crypto.randomUUID()}`,
      amount: total,
      payerEmail: email.trim(),
      description: `${event.name} registration`,
      // Kept for visibility in the Xendit dashboard only — Xendit does not
      // reliably echo this back in the webhook callback, so registration
      // state relies on the pending row below (keyed by invoice id), not this.
      metadata: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        country: country.trim(),
        company: company.trim(),
      },
      successRedirectUrl: `${siteUrl}/register/success`,
      failureRedirectUrl: `${siteUrl}/register`,
      paymentMethods: XENDIT_METHOD_CODES[method.id],
    });
  } catch (error) {
    console.error("Failed to create Xendit invoice", error);
    return Response.json({ error: "Failed to create invoice" }, { status: 502 });
  }

  // Save the registration as "pending" now, keyed by the invoice id, so the
  // webhook only needs to flip it to "paid" — no reliance on webhook metadata.
  const supabase = getSupabaseServerClient();
  const { error: insertError } = await supabase.from("registrations").insert({
    full_name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    country: country.trim(),
    company: company.trim(),
    amount: total,
    currency: "IDR",
    payment_provider: "xendit",
    payment_status: "pending",
    payment_reference: invoice.id,
  });

  if (insertError) {
    console.error("Failed to save pending Xendit registration", insertError);
    return Response.json({ error: "Failed to start payment" }, { status: 500 });
  }

  return Response.json({ invoiceUrl: invoice.invoiceUrl });
}
