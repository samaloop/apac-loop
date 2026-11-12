import "server-only";
import { timingSafeEqual } from "node:crypto";

// Minimal shared-secret gate for the admin API routes: the admin page sends
// the ADMIN_SECRET the operator typed in as an x-admin-secret header.
export function isAdminRequest(request: Request): boolean {
  const expectedSecret = process.env.ADMIN_SECRET;
  const receivedSecret = request.headers.get("x-admin-secret");
  if (!expectedSecret || !receivedSecret) return false;

  const expected = Buffer.from(expectedSecret);
  const received = Buffer.from(receivedSecret);
  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
