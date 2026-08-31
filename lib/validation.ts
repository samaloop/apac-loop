export type RegistrationFields = {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  company?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistrationFields(fields: RegistrationFields): string | null {
  const { name, email, phone, country, company } = fields;
  if (!name?.trim()) return "Name is required";
  if (!email?.trim() || !EMAIL_PATTERN.test(email.trim())) return "A valid email is required";
  if (!phone?.trim()) return "Phone is required";
  if (!country?.trim()) return "Country is required";
  if (!company?.trim()) return "Company is required";
  return null;
}
