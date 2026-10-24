import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const PHOTO_BUCKET = "memory-photos";

let client: SupabaseClient | null = null;

// Accept the names Vercel's Supabase integration sets as well as our own.
const supabaseUrl = () => process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

// Server-side client using the service role key. It bypasses row level security,
// so it must never be imported into a client component.
export function supabaseAdmin(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabaseKey();
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export function photoUrl(path: string) {
  return `${supabaseUrl()}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
