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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type SendTicketEmailArgs = {
  to: string;
  name: string;
  ticketCode: string;
};

function buildTicketEmailHtml({ name, ticketCode }: { name: string; ticketCode: string }) {
  const safeName = escapeHtml(name);
  const safeTicketCode = escapeHtml(ticketCode);

  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1e7d3; padding:32px 16px; font-family:Arial, Helvetica, sans-serif;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#fbf6ee; border-radius:24px; overflow:hidden;">
        <tr>
          <td style="background-color:#01112b; padding:40px 40px 28px 40px;">
            <p style="margin:0 0 10px 0; font-size:12px; font-weight:bold; letter-spacing:2px; text-transform:uppercase; color:#d9a441;">
              Ticket Confirmed
            </p>
            <p style="margin:0 0 6px 0; font-size:13px; color:#b9ae9c;">
              ${escapeHtml(event.tagline)}
            </p>
            <h1 style="margin:0; font-size:28px; line-height:1.25; color:#fbf6ee; font-weight:bold;">
              ${escapeHtml(event.name)}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="height:4px; line-height:0; font-size:0; background-color:#c75b39;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:32px 40px 8px 40px;">
            <p style="margin:0 0 24px 0; font-size:16px; line-height:1.6; color:#2a211a;">
              You're registered, <strong>${safeName}</strong>! Here's your ticket — bring the QR
              code below to check in at the venue.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1e7d3; border-radius:16px; margin-bottom:8px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 3px 0; font-size:11px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#c75b39;">
                    When
                  </p>
                  <p style="margin:0 0 16px 0; font-size:15px; color:#2a211a;">
                    ${escapeHtml(event.date)}
                  </p>
                  <p style="margin:0 0 3px 0; font-size:11px; font-weight:bold; letter-spacing:1px; text-transform:uppercase; color:#c75b39;">
                    Where
                  </p>
                  <p style="margin:0; font-size:15px; line-height:1.5; color:#2a211a;">
                    ${escapeHtml(venue.name)}<br />${escapeHtml(venue.address)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:24px 40px 32px 40px;">
            <p style="margin:0 0 12px 0; font-size:13px; color:#6b6250;">
              Show this QR code at check-in
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="border:1px solid #e4dac4; border-radius:16px; background-color:#ffffff;">
              <tr>
                <td style="padding:16px;">
                  <img
                    src="cid:ticket-qr"
                    width="220"
                    height="220"
                    alt="Ticket QR code"
                    style="display:block; width:220px; height:220px;"
                  />
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0 0; font-size:12px; letter-spacing:0.5px; color:#6b6250;">
              Ticket code: ${safeTicketCode}
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px 32px 40px; border-top:1px solid #e4dac4;">
            <p style="margin:0; font-size:13px; color:#6b6250;">
              Organized by ${escapeHtml(event.organizer)}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
}

export async function sendTicketEmail({ to, name, ticketCode }: SendTicketEmailArgs) {
  const from = process.env.EMAIL_FROM_DEV;
  if (!from) {
    throw new Error("Missing EMAIL_FROM");
  }

  const qrBuffer = await QRCode.toBuffer(ticketCode, { width: 320, margin: 2 });
  const resend = getResendClient();

  await resend.emails.send({
    from,
    to,
    subject: `Your ticket for ${event.name}`,
    html: buildTicketEmailHtml({ name, ticketCode }),
    attachments: [
      {
        filename: "ticket-qr.png",
        content: qrBuffer,
        contentId: "ticket-qr",
      },
    ],
  });
}
