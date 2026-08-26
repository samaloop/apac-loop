import "server-only";
import { Resend } from "resend";
import QRCode from "qrcode";
import { event } from "@/app/data/event";
import { venue } from "@/app/data/venue";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

type SendTicketEmailArgs = {
  to: string;
  name: string;
  ticketCode: string;
};

export async function sendTicketEmail({ to, name, ticketCode }: SendTicketEmailArgs) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Missing EMAIL_FROM");
  }

  const qrBuffer = await QRCode.toBuffer(ticketCode, { width: 320, margin: 2 });
  const resend = getResendClient();

  await resend.emails.send({
    from,
    to,
    subject: `Your ticket for ${event.name}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 20px;">You're registered, ${name}!</h1>
        <p>${event.name} &middot; ${event.date} &middot; ${event.location}</p>
        <p>${venue.name}<br />${venue.address}</p>
        <p>Show the QR code below at check-in.</p>
        <img src="cid:ticket-qr" alt="Ticket QR code" width="240" height="240" />
        <p style="color: #666; font-size: 12px;">Ticket code: ${ticketCode}</p>
      </div>
    `,
    attachments: [
      {
        filename: "ticket-qr.png",
        content: qrBuffer,
        contentId: "ticket-qr",
      },
    ],
  });
}
