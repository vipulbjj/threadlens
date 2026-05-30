import { NextResponse } from "next/server";
import { resolveAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { usageFromCounts } from "@/lib/usage";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      authenticated: false,
      authEnabled: false,
      isPremium: false,
      usage: usageFromCounts(false, 0),
    });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ authenticated: false, authEnabled: false }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({
      authenticated: false,
      authEnabled: true,
      isPremium: false,
      usage: usageFromCounts(false, 0),
    });
  }

  const account = await resolveAccount(user.id, user.email);
  return NextResponse.json({
    authenticated: true,
    authEnabled: true,
    email: account.email,
    isPremium: account.isPremium,
    usage: account.usage,
  });
}
