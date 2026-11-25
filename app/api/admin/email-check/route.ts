import { Resend } from "resend";
import { isAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { enforceRateLimit } from "@/lib/rate-limit";

// Admin-only diagnostics for the ticket emails, for when the host's log
// viewer is unavailable. GET reports which email settings the running server
// can read (never their values); POST sends one test email to
// ADMIN_NOTIFICATION_EMAIL and returns Resend's answer as-is.

function emailSettings() {
  const from = process.env.EMAIL_FROM ?? "";
  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? "set" : "MISSING",
    EMAIL_FROM: from ? `set (domain ${from.match(/@([^>\s]+)/)?.[1] ?? "unreadable"})` : "MISSING",
    ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL ? "set" : "MISSING",
  };
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, "admin", 20, 60_000);
  if (limited) return limited;
  if (!isAdminRequest(request)) return unauthorizedResponse();
  return Response.json(emailSettings());
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, "admin", 20, 60_000);
  if (limited) return limited;
  if (!isAdminRequest(request)) return unauthorizedResponse();

  const settings = emailSettings();
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !from || !to) {
    return Response.json({ sent: false, settings }, { status: 500 });
  }

  const { data, error } = await new Resend(apiKey).emails.send({
    from,
    to,
    subject: "Email check: APAC Coaching Conference 2027",
    html: "<p>Test email from the conference server. If you can read this, ticket emails can be sent.</p>",
  });
  return Response.json({ sent: !error, settings, resend: error ?? { id: data?.id } }, { status: error ? 502 : 200 });
}
