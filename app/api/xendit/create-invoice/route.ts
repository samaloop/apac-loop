import { createInvoice } from "@/lib/xendit";
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

  try {
    const invoice = await createInvoice({
      externalId: `reg-${crypto.randomUUID()}`,
      amount: total,
      payerEmail: email.trim(),
      description: `${event.name} registration`,
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
    return Response.json({ invoiceUrl: invoice.invoiceUrl });
  } catch (error) {
    console.error("Failed to create Xendit invoice", error);
    return Response.json({ error: "Failed to create invoice" }, { status: 502 });
  }
}
