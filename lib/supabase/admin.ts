import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS entirely. Server-only: never import
// this from a "use client" component or expose SUPABASE_SERVICE_ROLE_KEY
// to the browser. Used only for signup, where the user isn't authenticated
// yet so the normal RLS-scoped clients can't create their account for them.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
