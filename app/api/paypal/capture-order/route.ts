import { captureOrder } from "@/lib/paypal";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";
import { validateRegistrationFields } from "@/lib/validation";

type CaptureRequestBody = {
  orderID?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  company?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as CaptureRequestBody;

  if (!body.orderID) {
    return Response.json({ success: false, error: "Missing orderID" }, { status: 400 });
  }

  const validationError = validateRegistrationFields(body);
  if (validationError) {
    return Response.json({ success: false, error: validationError }, { status: 400 });
  }

  const { orderID, name, email, phone, country, company } = body as Required<CaptureRequestBody>;

  let capture;
  try {
    capture = await captureOrder(orderID);
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
  const { data: registration, error: insertError } = await supabase
    .from("registrations")
    .insert({
      full_name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      company: company.trim(),
      // The amount PayPal's own capture response confirms was charged —
      // the authoritative source, not a recomputed guess.
      amount: capture.amount,
      currency: capture.currency ?? "USD",
      payment_provider: "paypal",
      payment_status: "paid",
      payment_reference: orderID,
    })
    .select("ticket_code")
    .single();

  if (insertError || !registration) {
    console.error("Failed to save registration", insertError);
    return Response.json(
      { success: false, error: "Payment succeeded but saving your registration failed. Contact us with your PayPal order ID." },
      { status: 500 }
    );
  }

  try {
    await sendTicketEmail({
      to: email.trim(),
      name: name.trim(),
      ticketCode: registration.ticket_code,
    });
  } catch (error) {
    console.error("Failed to send ticket email", error);
    return Response.json(
      {
        success: true,
        ticketCode: registration.ticket_code,
        warning: "Registered, but the ticket email failed to send. Contact us with your PayPal order ID.",
      },
      { status: 200 }
    );
  }

  return Response.json({ success: true, ticketCode: registration.ticket_code });
}
