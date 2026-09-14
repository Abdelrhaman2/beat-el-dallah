import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oymfimtltmuyuwdmditq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bWZpbXRsdG11eXV3ZG1kaXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTUzNDEsImV4cCI6MjEwNDg3MTM0MX0.KcNMyI88rwR8XZC3CiySh0uq6ePVuUxu3s3TB24qMu0";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Server-side anonymous client
export function createServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });
}

// CRITICAL (Amendment #1): Privileged admin client using service_role key
// Used exclusively inside trusted server-side route handlers (e.g., /api/orders)
// to perform validated order inserts that bypass public RLS policies.
export function createAdminSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
