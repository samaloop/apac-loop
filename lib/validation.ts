import { pricingTiers } from "@/app/data/pricing";

export type RegistrationFields = {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  company?: string;
  ticketType?: string;
  isMember?: boolean;
  memberId?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_TICKETS_PER_ORDER = 10;

export function validateRegistrationFields(fields: RegistrationFields): string | null {
  const { name, email, phone, country, company, ticketType, isMember, memberId } = fields;
  if (!name?.trim()) return "Name is required";
  if (!email?.trim() || !EMAIL_PATTERN.test(email.trim())) return "A valid email is required";
  if (!phone?.trim()) return "Phone is required";
  if (!country?.trim()) return "Country is required";
  if (!company?.trim()) return "Company is required";
  if (!ticketType?.trim() || !pricingTiers.some((tier) => tier.id === ticketType)) {
    return "A valid ticket type is required";
  }
  // Membership isn't verified against anything yet — just collected so the
  // discount can be reconciled manually later. Still require the ID be
  // filled in whenever the member discount is being claimed.
  if (isMember && !memberId?.trim()) return "Member ID is required for member pricing";
  return null;
}

export function validateTickets(tickets: RegistrationFields[] | undefined): string | null {
  if (!tickets || tickets.length === 0) return "At least one ticket is required";
  if (tickets.length > MAX_TICKETS_PER_ORDER) {
    return `A maximum of ${MAX_TICKETS_PER_ORDER} tickets is allowed per order`;
  }
  for (let i = 0; i < tickets.length; i++) {
    const error = validateRegistrationFields(tickets[i]);
    if (error) return `Attendee ${i + 1}: ${error}`;
  }
  return null;
}
