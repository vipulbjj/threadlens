export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim())
  );
}

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!.trim()
  );
}

export function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

/** Owner / early-access emails granted premium when PREMIUM_EMAILS env is missing or misconfigured. */
const PREMIUM_EMAIL_ALLOWLIST = ["vbajaj56@gmail.com"];

/** Comma-separated emails auto-granted premium (manual YC / mail onboarding). */
export function premiumEmailsFromEnv(): Set<string> {
  const raw = process.env.PREMIUM_EMAILS?.trim() || "";
  const fromEnv = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...PREMIUM_EMAIL_ALLOWLIST, ...fromEnv]);
}

export function premiumContactEmail() {
  return process.env.PREMIUM_CONTACT_EMAIL?.trim() || "hello@vipulbajaj.com";
}
