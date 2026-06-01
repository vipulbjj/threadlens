import { NextResponse } from "next/server";
import { probeAiProvider } from "@/lib/ai-probe";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const maxDuration = 30;

/**
 * Authenticated AI credential probe. Sign in, then GET /api/ai-health (or run from DevTools).
 * Does not expose API keys — only provider, model, and xAI error summary.
 */
export async function GET() {
  if (!isSupabaseConfigured()) {
    const probe = await probeAiProvider();
    return NextResponse.json({ authenticated: false, authEnabled: false, ...probe });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Auth service unavailable." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json(
      { error: "Sign in to run the AI health check.", authenticated: false },
      { status: 401 }
    );
  }

  const probe = await probeAiProvider();
  return NextResponse.json({
    authenticated: true,
    email: user.email,
    checkedAt: new Date().toISOString(),
    ...probe,
  }, { status: probe.ok ? 200 : 503 });
}
