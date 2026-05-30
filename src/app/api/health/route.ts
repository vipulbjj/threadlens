import { NextResponse } from "next/server";
import { resolveAiProvider } from "@/lib/ai-provider";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET() {
  const provider = resolveAiProvider();
  return NextResponse.json({
    ok: true,
    ai: provider ? { provider: provider.id, model: provider.model } : { provider: "none" },
    auth: isSupabaseConfigured(),
    timestamp: new Date().toISOString(),
  });
}
