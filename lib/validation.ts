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

// Upper bounds on each free-text field. These stop a malicious/buggy client
// from sending megabyte-sized values that get stored in the DB and pasted
// into confirmation emails. Generous enough for any real attendee.
const MAX_LENGTHS = {
  name: 120,
  email: 160,
  phone: 40,
  country: 80,
  company: 160,
  memberId: 60,
} as const;

export function validateRegistrationFields(fields: RegistrationFields): string | null {
  const { name, email, phone, country, company, ticketType, isMember, memberId } = fields;
  if (!name?.trim()) return "Name is required";
  if (name.length > MAX_LENGTHS.name) return `Name must be ${MAX_LENGTHS.name} characters or fewer`;
  if (!email?.trim() || !EMAIL_PATTERN.test(email.trim())) return "A valid email is required";
  if (email.length > MAX_LENGTHS.email) return `Email must be ${MAX_LENGTHS.email} characters or fewer`;
  if (!phone?.trim()) return "Phone is required";
  if (phone.length > MAX_LENGTHS.phone) return `Phone must be ${MAX_LENGTHS.phone} characters or fewer`;
  if (!country?.trim()) return "Country is required";
  if (country.length > MAX_LENGTHS.country) return `Country must be ${MAX_LENGTHS.country} characters or fewer`;
  if (!company?.trim()) return "Company is required";
  if (company.length > MAX_LENGTHS.company) return `Company must be ${MAX_LENGTHS.company} characters or fewer`;
  if (!ticketType?.trim() || !pricingTiers.some((tier) => tier.id === ticketType)) {
    return "A valid ticket type is required";
  }
  // Shape check only: the real membership check is server-side against the
  // APAC verification record (lib/apac.ts), which also supplies the stored ID.
  if (isMember && !memberId?.trim()) return "Member ID is required for member pricing";
  if (memberId && memberId.length > MAX_LENGTHS.memberId) {
    return `Member ID must be ${MAX_LENGTHS.memberId} characters or fewer`;
  }
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
