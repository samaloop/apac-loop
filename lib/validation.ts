export type RegistrationFields = {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  company?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MAX_TICKETS_PER_ORDER = 10;

export function validateRegistrationFields(fields: RegistrationFields): string | null {
  const { name, email, phone, country, company } = fields;
  if (!name?.trim()) return "Name is required";
  if (!email?.trim() || !EMAIL_PATTERN.test(email.trim())) return "A valid email is required";
  if (!phone?.trim()) return "Phone is required";
  if (!country?.trim()) return "Country is required";
  if (!company?.trim()) return "Company is required";
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
