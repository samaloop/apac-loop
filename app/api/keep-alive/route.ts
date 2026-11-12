import { getSupabaseServerClient } from "@/lib/supabase";

// Hit periodically by .github/workflows/keep-supabase-alive.yml so Supabase
// sees API activity and doesn't auto-pause the free-tier project after 7
// days of inactivity. Only checks for an error — never returns row data.
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from("orders").select("id").limit(1);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Keep-alive ping failed", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
