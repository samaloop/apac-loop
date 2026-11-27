import "server-only";
import { Resend } from "resend";
import QRCode from "qrcode";
import { event, helpWhatsAppUrl } from "@/app/data/event";
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

// Brand palette, mirrored from app/globals.css (email clients can't read CSS vars).
const C = {
  night: "#00112c",
  blue: "#003f85",
  tint: "#ecf5ff",
  cream: "#fffaef",
  yellow: "#ffcc00",
  yellowText: "#ffd400",
  coral: "#ff5b5b",
  teal: "#59dbd1",
  text: "#24324a",
  muted: "#717171",
  rule: "#c5c5c5",
};

const FONT = "'Poppins', Arial, Helvetica, sans-serif";
const MONO = "'Courier New', Courier, monospace";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://apacconference2027.com").replace(/\/$/, "");

// Shared document shell: viewport meta plus a small mobile stylesheet. Inline
// styles carry the design in every client; the media query only tightens the
// spacing and stacks columns on narrow screens.
function emailDocument({ title, preheader, body }: { title: string; preheader: string; body: string }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,600;0,700;1,700&display=swap" rel="stylesheet" />
<style>
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; }
  @media only screen and (max-width:620px) {
    .outer { padding:0 !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .hero-title { font-size:36px !important; }
    .stack { display:block !important; width:100% !important; box-sizing:border-box; }
    .stack-gap { padding:0 20px 20px 22px !important; }
    .btn a { display:block !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:${C.cream};">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream};">
  <tr>
    <td class="outer" align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; font-family:${FONT}; color:${C.text};">
${body}
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// Blue hero like the site's PageHero: yellow eyebrow, uppercase title whose
// last word is the yellow italic highlight, then the teal accent bar.
function heroRows(eyebrow: string, fontSize = 48) {
  const words = event.name.split(" ");
  const highlight = words.pop() ?? "";
  const lead = words.join(" ");
  return `
        <tr>
          <td class="px" style="background-color:${C.blue}; padding:36px 40px 40px 40px;">
            <p style="margin:0 0 14px 0; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${C.yellow};">${escapeHtml(eyebrow)}</p>
            <p style="margin:0 0 8px 0; font-size:14px; color:#ffffff;">${escapeHtml(event.tagline)}</p>
            <h1 class="hero-title" style="margin:0; font-size:${fontSize}px; line-height:1.02; font-weight:700; letter-spacing:-1.5px; text-transform:uppercase; color:#ffffff;">${escapeHtml(lead)}<br /><em style="font-style:italic; color:${C.yellowText};">${escapeHtml(highlight)}.</em></h1>
          </td>
        </tr>
        <tr>
          <td style="height:8px; line-height:8px; font-size:0; background-color:${C.teal};">&nbsp;</td>
        </tr>`;
}

function footerRows() {
  const siteLabel = SITE_URL.replace(/^https?:\/\//, "");
  return `
        <tr>
          <td class="px" style="background-color:${C.night}; padding:24px 40px;">
            <p style="margin:0 0 4px 0; font-size:13px; font-weight:700; color:#ffffff;">${escapeHtml(event.tagline)}</p>
            <p style="margin:0; font-size:12px; line-height:1.6; color:#c9d3e3;">Organized by ${escapeHtml(event.organizer)} · <a href="${SITE_URL}" style="color:${C.yellow}; text-decoration:underline;">${escapeHtml(siteLabel)}</a></p>
          </td>
        </tr>`;
}

type SendTicketEmailArgs = {
  to: string;
  name: string;
  ticketCode: string;
};

export function buildTicketEmailHtml({ name, ticketCode }: { name: string; ticketCode: string }) {
  const safeName = escapeHtml(name);
  const safeTicketCode = escapeHtml(ticketCode);
  const label = `margin:0 0 4px 0; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${C.coral};`;
  const value = `margin:0; font-size:16px; line-height:1.45; font-weight:600; color:${C.blue};`;

  const body = `${heroRows("Ticket confirmed")}
        <tr>
          <td class="px" style="padding:32px 40px 0 40px;">
            <p style="margin:0; font-size:16px; line-height:1.65; color:${C.text};">You're registered, <strong style="color:${C.blue};">${safeName}</strong>! Your ticket is below. Show the QR code at check-in.</p>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:24px 40px 0 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.tint}; border-left:6px solid ${C.blue};">
              <tr>
                <td class="stack" valign="top" width="50%" style="padding:20px 20px 20px 22px;">
                  <p style="${label}">When</p>
                  <p style="${value}">${escapeHtml(event.date)}</p>
                </td>
                <td class="stack stack-gap" valign="top" width="50%" style="padding:20px 20px 20px 0;">
                  <p style="${label}">Where</p>
                  <p style="${value}">${escapeHtml(venue.name)}<br /><span style="font-weight:400; color:${C.text};">${escapeHtml(venue.address)}</span></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" align="center" style="padding:32px 40px 0 40px;">
            <p style="margin:0 0 14px 0; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${C.blue};">Your check-in QR code</p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="border:2px solid ${C.blue}; background-color:#ffffff;">
              <tr>
                <td style="padding:14px;">
                  <img src="cid:ticket-qr" width="220" height="220" alt="Ticket QR code" style="display:block; width:220px; height:220px; border:0;" />
                </td>
              </tr>
            </table>
            <p style="margin:16px 0 0 0; font-size:12px; color:${C.muted};">Ticket code</p>
            <p style="margin:2px 0 0 0; font-family:${MONO}; font-size:15px; font-weight:700; letter-spacing:1px; color:${C.blue}; word-break:break-all;">${safeTicketCode}</p>
          </td>
        </tr>
        <tr>
          <td class="px btn" align="center" style="padding:28px 40px 0 40px;">
            <a href="${SITE_URL}" style="display:inline-block; background-color:${C.yellow}; color:${C.blue}; font-family:${FONT}; font-size:15px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; text-decoration:none; padding:14px 32px; border:2px solid ${C.yellow};">View event details</a>
          </td>
        </tr>
        <tr>
          <td class="px" align="center" style="padding:20px 40px 32px 40px;">
            <p style="margin:0; font-size:14px; line-height:1.6; color:${C.text};">Questions? <a href="${helpWhatsAppUrl}" style="color:${C.blue}; font-weight:700; text-decoration:underline;">Chat with us on WhatsApp</a></p>
          </td>
        </tr>${footerRows()}`;

  return emailDocument({
    title: `Your ticket for ${event.name}`,
    preheader: `You're registered for ${event.name}, ${event.date}. Your check-in QR code is inside.`,
    body,
  });
}

export async function sendTicketEmail({ to, name, ticketCode }: SendTicketEmailArgs) {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("Missing EMAIL_FROM");
  }

  const qrBuffer = await QRCode.toBuffer(ticketCode, { width: 440, margin: 2 });
  const resend = getResendClient();

  // Resend reports API failures (unverified domain, test sender, bad key) in
  // `error` instead of throwing, so surface them — callers count rejections.
  const { error } = await resend.emails.send({
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
  if (error) {
    console.error(`Resend rejected the ticket email to ${to}:`, error);
    throw new Error(`Resend: ${error.message}`);
  }
}

export type AdminNotificationOrder = {
  provider: "paypal" | "xendit";
  amount: string | number;
  currency: string;
  paymentReference: string;
  quantity: number;
  promoCode?: string | null;
};

export type AdminNotificationAttendee = {
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  ticketCode: string;
  isMember: boolean;
  memberId: string | null;
};

// 6127900 IDR → "6,127,900"; 425 SGD → "425.00". Falls back to the raw value.
function formatOrderAmount(order: AdminNotificationOrder): string {
  const amount = Number(order.amount);
  if (!Number.isFinite(amount)) return String(order.amount);
  const decimals = order.currency === "IDR" ? 0 : 2;
  return amount.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

// One label/value line; stays two columns even on phones (short labels).
function detailRow(label: string, valueHtml: string) {
  return `
                <tr>
                  <td valign="top" width="38%" style="padding:6px 12px 6px 0; font-size:13px; color:${C.muted};">${escapeHtml(label)}</td>
                  <td valign="top" style="padding:6px 0; font-size:14px; color:${C.text}; word-break:break-word;">${valueHtml}</td>
                </tr>`;
}

export function buildAdminNotificationHtml({
  order,
  attendees,
}: {
  order: AdminNotificationOrder;
  attendees: AdminNotificationAttendee[];
}) {
  const providerLabel = order.provider === "paypal" ? "PayPal" : "Xendit";
  const mono = (value: string) =>
    `<span style="font-family:${MONO}; font-size:13px;">${escapeHtml(value)}</span>`;

  // Each attendee is its own stacked card, so the email reads on a phone
  // instead of forcing a seven-column table sideways.
  const attendeeCards = attendees
    .map(
      (attendee, i) => `
        <tr>
          <td class="px" style="padding:0 40px 16px 40px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.rule}; border-top:4px solid ${C.teal};">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 8px 0; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${C.coral};">Attendee ${i + 1}</p>
                  <p style="margin:0 0 8px 0; font-size:17px; font-weight:700; color:${C.blue};">${escapeHtml(attendee.name)}</p>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${detailRow("Email", `<a href="mailto:${escapeHtml(attendee.email)}" style="color:${C.blue};">${escapeHtml(attendee.email)}</a>`)}
                    ${detailRow("Phone", escapeHtml(attendee.phone))}
                    ${detailRow("Country", escapeHtml(attendee.country))}
                    ${detailRow("Company", escapeHtml(attendee.company))}
                    ${detailRow("Member", attendee.isMember ? `Yes · ${escapeHtml(attendee.memberId ?? "")}` : "No")}
                    ${detailRow("Ticket code", mono(attendee.ticketCode))}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    )
    .join("");

  const body = `${heroRows(`New ${providerLabel} registration`, 30)}
        <tr>
          <td class="px" style="padding:28px 40px 8px 40px;">
            <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${C.coral};">Amount paid</p>
            <p style="margin:0 0 16px 0; font-size:28px; font-weight:700; color:${C.blue};">${escapeHtml(formatOrderAmount(order))} ${escapeHtml(order.currency)}</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.tint}; border-left:6px solid ${C.blue};">
              <tr>
                <td style="padding:12px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${detailRow("Tickets", `${order.quantity} ticket${order.quantity > 1 ? "s" : ""}`)}
                    ${detailRow("Provider", providerLabel)}
                    ${detailRow("Payment ref", mono(order.paymentReference))}
                    ${order.promoCode ? detailRow("Promo code", mono(order.promoCode)) : ""}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:20px 40px 12px 40px;">
            <p style="margin:0; font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:${C.blue};">Attendees</p>
          </td>
        </tr>${attendeeCards}
        <tr><td style="height:16px; line-height:16px; font-size:0;">&nbsp;</td></tr>${footerRows()}`;

  return emailDocument({
    title: `New ${providerLabel} registration`,
    preheader: `${order.quantity} ticket${order.quantity > 1 ? "s" : ""} · ${order.amount} ${order.currency} via ${providerLabel}`,
    body,
  });
}

// Internal record-keeping notification — sent to the team, not the buyer.
// Best-effort: never throws, so a misconfigured/failing admin email can
// never break the actual purchase flow. Call it after the buyer-facing
// ticket emails have already gone out.
export async function sendAdminNotification({
  order,
  attendees,
}: {
  order: AdminNotificationOrder;
  attendees: AdminNotificationAttendee[];
}) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  const from = process.env.EMAIL_FROM;
  if (!to || !from) {
    console.error("Skipping admin notification: ADMIN_NOTIFICATION_EMAIL or EMAIL_FROM not configured");
    return;
  }

  try {
    const resend = getResendClient();
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `[${order.provider}] New registration — ${order.quantity} ticket${order.quantity > 1 ? "s" : ""}, ${order.amount} ${order.currency}`,
      html: buildAdminNotificationHtml({ order, attendees }),
    });
    if (error) {
      console.error("Resend rejected the admin notification email:", error);
    }
  } catch (error) {
    console.error("Failed to send admin notification email", error);
  }
}
