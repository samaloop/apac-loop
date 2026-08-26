import { captureOrder } from "@/lib/paypal";
import { getSupabaseServerClient } from "@/lib/supabase";
import { sendTicketEmail } from "@/lib/email";

type CaptureRequestBody = {
  orderID?: string;
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  company?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: CaptureRequestBody) {
  const { orderID, name, email, phone, country, company } = body;
  if (!orderID) return "Missing orderID";
  if (!name?.trim()) return "Name is required";
  if (!email?.trim() || !EMAIL_PATTERN.test(email.trim())) return "A valid email is required";
  if (!phone?.trim()) return "Phone is required";
  if (!country?.trim()) return "Country is required";
  if (!company?.trim()) return "Company is required";
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json()) as CaptureRequestBody;

  const validationError = validate(body);
  if (validationError) {
    return Response.json({ success: false, error: validationError }, { status: 400 });
  }

  const { orderID, name, email, phone, country, company } = body as Required<CaptureRequestBody>;

  const price = process.env.TICKET_PRICE_USD;
  if (!price) {
    return Response.json(
      { success: false, error: "Ticket price is not configured" },
      { status: 500 }
    );
  }

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
      amount: price,
      currency: "USD",
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
