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
    { label: "Save to Files (or Notes/Mail)", sub: "Upload the .zip or .txt here — iPhone often gives you a ZIP" },
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
  ios: "1. Open chat\n2. Tap contact name\n3. Scroll → Export Chat\n4. Without Media\n5. Save to Files → upload the .zip or .txt here",
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
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden text-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[var(--color-border)]">
        <p className="font-medium text-[var(--color-foreground)] flex items-center gap-2">
          {isMobile ? <Smartphone className="h-4 w-4 tl-accent" /> : <Monitor className="h-4 w-4 tl-accent" />}
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
                  ? "bg-emerald-500/20 text-emerald-900 ring-1 ring-emerald-600/35 dark:text-emerald-200"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
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
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 tl-accent text-xs font-bold ring-1 ring-emerald-500/30">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-[var(--color-foreground)] leading-snug">{step.label}</p>
              {step.sub && <p className="text-[var(--color-muted-foreground)] text-xs mt-0.5">{step.sub}</p>}
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:border-[var(--color-ring)] transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 tl-accent" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy steps"}
        </button>
      </div>
    </div>
  );
}
