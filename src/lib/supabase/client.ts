import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oymfimtltmuyuwdmditq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95bWZpbXRsdG11eXV3ZG1kaXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTUzNDEsImV4cCI6MjEwNDg3MTM0MX0.KcNMyI88rwR8XZC3CiySh0uq6ePVuUxu3s3TB24qMu0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
