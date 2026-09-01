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

export type Order = {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  quantity: number;
  amount: string;
  currency: string;
  payment_provider: "paypal" | "xendit";
  payment_status: "pending" | "paid" | "refunded";
  payment_reference: string;
  created_at: string;
};

export type Ticket = {
  id: string;
  order_id: string;
  ticket_code: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  checked_in_at: string | null;
  created_at: string;
};
