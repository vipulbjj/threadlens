import { NextResponse } from "next/server";
import { resolveAiProvider } from "@/lib/ai-provider";

export async function GET() {
  const provider = resolveAiProvider();
  return NextResponse.json({
    ok: true,
    ai: provider ? { provider: provider.id, model: provider.model } : { provider: "none" },
    timestamp: new Date().toISOString(),
  });
}
