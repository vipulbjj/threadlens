"use client";

import { useEffect, useState } from "react";
import { Smartphone, Monitor, Copy, Check, ExternalLink } from "lucide-react";

type Platform = "ios" | "android" | "desktop";

const STEPS: Record<Platform, { label: string; sub?: string }[]> = {
  ios: [
    { label: "Open the chat in WhatsApp" },
    { label: "Tap the contact or group name at the top" },
    { label: "Scroll down → tap Export Chat" },
    { label: "Choose Without Media" },
    { label: "Save to Files (or Notes/Mail)", sub: "Then come back and drop the .txt here" },
  ],
  android: [
    { label: "Open the chat in WhatsApp" },
    { label: "Tap ⋮ (top right) → More → Export chat" },
    { label: "Choose Without Media" },
    { label: "Save or share the .txt file", sub: "Try Save to Drive, then download it here" },
  ],
  desktop: [
    { label: "On your phone, open WhatsApp and the chat" },
    {
      label: "iOS: tap the name → Export Chat  |  Android: ⋮ → More → Export chat",
      sub: 'Choose "Without Media" on either',
    },
    { label: "Send the .txt to yourself — email, AirDrop, or Drive" },
    { label: "Download it on this device, then drop it above" },
  ],
};

const STEP_TEXT: Record<Platform, string> = {
  ios: "1. Open chat\n2. Tap contact name\n3. Scroll → Export Chat\n4. Without Media\n5. Save to Files → upload here",
  android: "1. Open chat\n2. ⋮ → More → Export chat\n3. Without Media\n4. Save .txt → upload here",
  desktop:
    "1. On phone: open chat\n2. iOS: tap name → Export Chat  |  Android: ⋮ → More → Export chat\n3. Without Media\n4. Send .txt to yourself → upload here",
};

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !("MSStream" in window)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export function ExportGuide({ platform: forcedPlatform }: { platform?: Platform }) {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [copied, setCopied] = useState(false);
  const isMobile = platform === "ios" || platform === "android";

  useEffect(() => {
    setPlatform(forcedPlatform ?? detectPlatform());
  }, [forcedPlatform]);

  const steps = STEPS[platform];

  function copySteps() {
    void navigator.clipboard.writeText(STEP_TEXT[platform]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden text-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-zinc-800/80">
        <p className="font-medium text-zinc-200 flex items-center gap-2">
          {isMobile ? <Smartphone className="h-4 w-4 text-emerald-400" /> : <Monitor className="h-4 w-4 text-emerald-400" />}
          How to export from WhatsApp
        </p>
        <div className="flex items-center gap-1.5">
          {/* Platform tabs */}
          {(["ios", "android", "desktop"] as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                platform === p
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {p === "ios" ? "iPhone" : p === "android" ? "Android" : "Desktop"}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <ol className="px-4 py-3 space-y-2.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold ring-1 ring-emerald-500/30">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-zinc-200 leading-snug">{step.label}</p>
              {step.sub && <p className="text-zinc-500 text-xs mt-0.5">{step.sub}</p>}
            </div>
          </li>
        ))}
      </ol>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-3">
        {isMobile && (
          <a
            href="whatsapp://"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 px-3 py-1.5 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/25 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={copySteps}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy steps"}
        </button>
      </div>
    </div>
  );
}
