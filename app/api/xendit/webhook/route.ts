import { timingSafeEqual } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendTicketEmail, sendAdminNotification } from "@/lib/email";

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

  // The order (and its tickets) were already created as "pending" when the
  // invoice was created (app/api/xendit/create-invoice), keyed by the
  // invoice id. Flip the order to "paid" here — only a row still "pending"
  // gets updated, so a duplicate webhook delivery is a no-op instead of
  // double-processing.
  const supabase = getSupabaseServerClient();
  const { data: order, error: updateError } = await supabase
    .from("orders")
    .update({ payment_status: "paid" })
    .eq("payment_reference", body.id)
    .eq("payment_status", "pending")
    .select("id, amount, currency, quantity")
    .single();

  if (updateError || !order) {
    // Either already processed by an earlier delivery of this same webhook,
    // or the pending order is missing entirely (create-invoice's insert failed).
    console.error("No pending Xendit order to update for", body.id, updateError);
    return Response.json({ ok: true, alreadyProcessedOrMissing: true });
  }

  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("ticket_code, email, full_name, phone, country, company")
    .eq("order_id", order.id);

  if (ticketsError || !tickets) {
    console.error("Failed to load tickets for paid Xendit order", order.id, ticketsError);
    return Response.json({ ok: true, ticketsLoadFailed: true });
  }

  const emailResults = await Promise.allSettled(
    tickets.map((ticket) =>
      sendTicketEmail({ to: ticket.email, name: ticket.full_name, ticketCode: ticket.ticket_code })
    )
  );
  const emailFailures = emailResults.filter((result) => result.status === "rejected").length;
  if (emailFailures > 0) {
    console.error(`Failed to send ${emailFailures} of ${tickets.length} ticket emails for order`, order.id);
  }

  await sendAdminNotification({
    order: {
      provider: "xendit",
      amount: order.amount,
      currency: order.currency,
      paymentReference: body.id,
      quantity: order.quantity,
    },
    attendees: tickets.map((ticket) => ({
      name: ticket.full_name,
      email: ticket.email,
      phone: ticket.phone,
      country: ticket.country,
      company: ticket.company,
      ticketCode: ticket.ticket_code,
    })),
  });

  return Response.json({ ok: true });
}
