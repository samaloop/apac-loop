import "server-only";
import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export type Registration = {
  id: string;
  ticket_code: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  amount: string;
  currency: string;
  payment_provider: "paypal";
  payment_status: "paid" | "refunded";
  payment_reference: string;
  checked_in_at: string | null;
  created_at: string;
};
