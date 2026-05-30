import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseUrl } from "./config";

export function createAdminClient() {
  const key = getServiceRoleKey();
  if (!key) return null;
  return createClient(getSupabaseUrl(), key, { auth: { autoRefreshToken: false, persistSession: false } });
}
