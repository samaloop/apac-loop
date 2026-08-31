import { timingSafeEqual } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";

type XenditInvoiceWebhookBody = {
  id: string;
  external_id?: string;
  status: string;
};

const PAID_STATUSES = new Set(["PAID", "SETTLED"]);
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

  // The registration row was already created as "pending" when the invoice
  // was created (app/api/xendit/create-invoice), keyed by the invoice id.
  // Flip it to "paid" here — only rows still "pending" get updated, so a
  // duplicate webhook delivery is a no-op instead of double-processing.
  const supabase = getSupabaseServerClient();
  const { data: registration, error: updateError } = await supabase
    .from("registrations")
    .update({ payment_status: "paid" })
    .eq("payment_reference", body.id)
    .eq("payment_status", "pending")
    .select("ticket_code, email, full_name")
    .single();

  if (updateError || !registration) {
    // Either already processed by an earlier delivery of this same webhook,
    // or the pending row is missing entirely (create-invoice's insert failed).
    console.error("No pending Xendit registration to update for", body.id, updateError);
    return Response.json({ ok: true, alreadyProcessedOrMissing: true });
  }

  try {
    await sendTicketEmail({
      to: registration.email,
      name: registration.full_name,
      ticketCode: registration.ticket_code,
    });
  } catch (error) {
    console.error("Failed to send ticket email for Xendit registration", error);
  }

  return Response.json({ ok: true });
}
