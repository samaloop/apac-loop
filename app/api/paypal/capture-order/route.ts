import { captureOrder } from "@/lib/paypal";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";
import { validateTickets, type RegistrationFields } from "@/lib/validation";

type CaptureRequestBody = {
  orderID?: string;
  tickets?: RegistrationFields[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as CaptureRequestBody;

  if (!body.orderID) {
    return Response.json({ success: false, error: "Missing orderID" }, { status: 400 });
  }

  const ticketsError = validateTickets(body.tickets);
  if (ticketsError) {
    return Response.json({ success: false, error: ticketsError }, { status: 400 });
  }
  const tickets = body.tickets as Required<RegistrationFields>[];
  const buyer = tickets[0];

  let capture;
  try {
    capture = await captureOrder(body.orderID);
  } catch (error) {
    console.error("Failed to capture PayPal order", error);
    return Response.json({ success: false, error: "Payment capture failed" }, { status: 502 });
  }

  if (capture.status !== "COMPLETED") {
    return Response.json(
      { success: false, error: `Payment not completed (status: ${capture.status})` },
      { status: 402 }
    );
  }

  const supabase = getSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_name: buyer.name!.trim(),
      buyer_email: buyer.email!.trim(),
      buyer_phone: buyer.phone!.trim(),
      quantity: tickets.length,
      // The amount PayPal's own capture response confirms was charged —
      // the authoritative source, not a recomputed guess.
      amount: capture.amount,
      currency: capture.currency ?? "USD",
      payment_provider: "paypal",
      payment_status: "paid",
      payment_reference: body.orderID,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Failed to save order", orderError);
    return Response.json(
      {
        success: false,
        error:
          "Payment succeeded but saving your order failed. Contact us with your PayPal order ID.",
      },
      { status: 500 }
    );
  }

  const { data: insertedTickets, error: ticketsInsertError } = await supabase
    .from("tickets")
    .insert(
      tickets.map((ticket) => ({
        order_id: order.id,
        full_name: ticket.name!.trim(),
        email: ticket.email!.trim(),
        phone: ticket.phone!.trim(),
        country: ticket.country!.trim(),
        company: ticket.company!.trim(),
      }))
    )
    .select("ticket_code, email, full_name");

  if (ticketsInsertError || !insertedTickets) {
    console.error("Failed to save tickets", ticketsInsertError);
    return Response.json(
      {
        success: false,
        error:
          "Payment succeeded but saving your tickets failed. Contact us with your PayPal order ID.",
      },
      { status: 500 }
    );
  }

  const emailResults = await Promise.allSettled(
    insertedTickets.map((ticket) =>
      sendTicketEmail({ to: ticket.email, name: ticket.full_name, ticketCode: ticket.ticket_code })
    )
  );
  const emailFailures = emailResults.filter((result) => result.status === "rejected").length;
  if (emailFailures > 0) {
    console.error(`Failed to send ${emailFailures} of ${insertedTickets.length} ticket emails`);
  }

  return Response.json({
    success: true,
    ticketCodes: insertedTickets.map((ticket) => ticket.ticket_code),
    ...(emailFailures > 0 && {
      warning: "Registered, but some ticket emails failed to send. Contact us if you're missing one.",
    }),
  });
}
