import { timingSafeEqual } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";

type XenditInvoiceWebhookBody = {
  id: string;
  external_id?: string;
  status: string;
  amount: number;
  currency: string;
  metadata?: {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    company?: string;
  };
};

const PAID_STATUSES = new Set(["PAID", "SETTLED"]);
const UNIQUE_VIOLATION = "23505";
// external_id prefix this app uses when creating invoices (app/api/xendit/create-invoice).
const OWN_EXTERNAL_ID_PREFIX = "reg-";

function isValidToken(receivedToken: string | null): boolean {
  const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!expectedToken || !receivedToken) return false;

  const expected = Buffer.from(expectedToken);
  const received = Buffer.from(receivedToken);
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

// Xendit only allows one webhook URL per event type per account. This app
// shares its Xendit account with another website that also uses Invoices,
// so this route is the single registered URL and forwards anything that
// isn't ours (identified by external_id prefix) to that other site's
// original webhook handler, unchanged.
async function forwardToOtherSite(rawBody: string, callbackToken: string) {
  const forwardUrl = process.env.XENDIT_OTHER_WEBHOOK_URL;
  if (!forwardUrl) {
    console.error("Received a non-registration Xendit webhook but XENDIT_OTHER_WEBHOOK_URL is not configured");
    return Response.json({ error: "No forward target configured" }, { status: 500 });
  }

  try {
    const response = await fetch(forwardUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-callback-token": callbackToken,
      },
      body: rawBody,
    });
    // Relay Xendit's expected 200 on success; a non-2xx here makes Xendit retry, same as if we'd handled it directly.
    return new Response(await response.text(), { status: response.status });
  } catch (error) {
    console.error("Failed to forward Xendit webhook to other site", error);
    return Response.json({ error: "Forward failed" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const callbackToken = request.headers.get("x-callback-token");
  if (!isValidToken(callbackToken)) {
    return Response.json({ error: "Invalid callback token" }, { status: 401 });
  }

  const rawBody = await request.text();
  const body = JSON.parse(rawBody) as XenditInvoiceWebhookBody;

  if (!body.external_id?.startsWith(OWN_EXTERNAL_ID_PREFIX)) {
    return forwardToOtherSite(rawBody, callbackToken as string);
  }

  if (!PAID_STATUSES.has(body.status)) {
    return Response.json({ ok: true, ignored: body.status });
  }

  const metadata = body.metadata;
  if (
    !metadata?.name ||
    !metadata.email ||
    !metadata.phone ||
    !metadata.country ||
    !metadata.company
  ) {
    console.error("Xendit webhook missing registration metadata", body.id);
    return Response.json({ error: "Missing registration metadata" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data: registration, error: insertError } = await supabase
    .from("registrations")
    .insert({
      full_name: metadata.name,
      email: metadata.email,
      phone: metadata.phone,
      country: metadata.country,
      company: metadata.company,
      amount: body.amount,
      currency: body.currency,
      payment_provider: "xendit",
      payment_status: "paid",
      payment_reference: body.id,
    })
    .select("ticket_code")
    .single();

  if (insertError) {
    if (insertError.code === UNIQUE_VIOLATION) {
      // Already processed a previous delivery of this same webhook — ack without re-sending.
      return Response.json({ ok: true, alreadyProcessed: true });
    }
    console.error("Failed to save Xendit registration", insertError);
    return Response.json({ error: "Failed to save registration" }, { status: 500 });
  }

  try {
    await sendTicketEmail({
      to: metadata.email,
      name: metadata.name,
      ticketCode: registration.ticket_code,
    });
  } catch (error) {
    console.error("Failed to send ticket email for Xendit registration", error);
  }

  return Response.json({ ok: true });
}
