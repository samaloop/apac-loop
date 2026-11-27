import { captureOrder } from "@/lib/paypal";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendTicketEmail, sendAdminNotification } from "@/lib/email";
import { findPromoCode, redeemPromoCode, toAppliedPromo } from "@/lib/promo";
import { validateTickets, type RegistrationFields } from "@/lib/validation";
import { getPricingTier, tierPriceFor } from "@/app/data/pricing";
import { promoDiscount } from "@/app/data/promo";
import { consumeVerification, getMemberVerification, verificationIdFrom } from "@/lib/apac";

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

  // The promo code comes back from PayPal itself (set as custom_id at
  // create-order), so it reflects the discount actually priced into this
  // payment. Looked up without re-checking validity — the payment already
  // happened at that price, this is only for the record.
  const promo = capture.customId ? await findPromoCode(capture.customId) : null;
  const basePrice = tickets.reduce((sum, ticket) => {
    const tier = getPricingTier(ticket.ticketType);
    return tier ? sum + tierPriceFor(tier, Boolean(ticket.isMember)) : sum;
  }, 0);
  // basePrice and the whole order are in SGD (PayPal's charge currency), so
  // the discount is already in the right currency.
  const discountAmount = promo ? promoDiscount(toAppliedPromo(promo), basePrice) : 0;

  // Member orders were checked at create-order; record the verified member ID
  // (never the one typed in the browser). If the check lapsed in between, the
  // payment has already gone through, so keep the order and log it for review.
  const isMemberOrder = tickets.some((ticket) => ticket.isMember);
  const verification = isMemberOrder
    ? await getMemberVerification(verificationIdFrom(request))
    : null;
  if (isMemberOrder && !verification) {
    console.warn(`PayPal order ${body.orderID}: member price paid without a usable APAC verification`);
  }
  const memberIdFor = (ticket: Required<RegistrationFields>) =>
    ticket.isMember ? (verification?.memberId ?? ticket.memberId.trim()) : null;

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
      currency: capture.currency ?? "SGD",
      payment_provider: "paypal",
      payment_status: "paid",
      payment_reference: body.orderID,
      promo_code: promo?.code ?? null,
      discount_amount: discountAmount,
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

  if (promo) {
    await redeemPromoCode(promo.code);
  }
  if (verification) {
    await consumeVerification(verification.id, order.id);
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
        ticket_type: ticket.ticketType!.trim(),
        is_member: Boolean(ticket.isMember),
        member_id: memberIdFor(ticket),
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
  const emailRejections = emailResults.filter((result) => result.status === "rejected");
  const emailFailures = emailRejections.length;
  if (emailFailures > 0) {
    console.error(
      `Failed to send ${emailFailures} of ${insertedTickets.length} ticket emails`,
      emailRejections.map((rejection) => String(rejection.reason))
    );
  }

  await sendAdminNotification({
    order: {
      provider: "paypal",
      amount: capture.amount ?? "unknown",
      currency: capture.currency ?? "SGD",
      paymentReference: body.orderID,
      quantity: tickets.length,
      promoCode: promo?.code ?? null,
    },
    attendees: tickets.map((ticket, index) => ({
      name: ticket.name!.trim(),
      email: ticket.email!.trim(),
      phone: ticket.phone!.trim(),
      country: ticket.country!.trim(),
      company: ticket.company!.trim(),
      ticketCode: insertedTickets[index]?.ticket_code ?? "unknown",
      isMember: Boolean(ticket.isMember),
      memberId: memberIdFor(ticket),
    })),
  });

  return Response.json({
    success: true,
    ticketCodes: insertedTickets.map((ticket) => ticket.ticket_code),
    ...(emailFailures > 0 && {
      warning: "Registered, but some ticket emails failed to send. Contact us if you're missing one.",
    }),
  });
}
