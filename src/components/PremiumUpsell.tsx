"use client";

import { useState } from "react";
import { Crown, Mail } from "lucide-react";
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_PREMIUM_CONTACT_EMAIL || "hello@vipulbajaj.com";

interface PremiumUpsellProps {
  reason?: "quota" | "import" | "general";
  email?: string;
  /** Shown when reason is quota — e.g. 30/30 used today */
  aiUsedToday?: number;
  aiLimitToday?: number;
}

export function PremiumUpsell({ reason = "general", email, aiUsedToday, aiLimitToday }: PremiumUpsellProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/premium/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, note: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessage(data.message);
      setStatus("done");
      if (data.mailto) window.open(data.mailto, "_blank");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not send request");
      setStatus("error");
    }
  };

  const copy =
    reason === "quota"
      ? typeof aiUsedToday === "number" && typeof aiLimitToday === "number" && aiLimitToday > 0
        ? `You've used all ${aiLimitToday} free AI questions for today (${aiUsedToday}/${aiLimitToday}). Your allowance resets at midnight UTC.`
        : "You've hit today's free AI question limit (30 per day). Your allowance resets at midnight UTC."
      : reason === "import"
        ? "This export is larger than the free tier keeps in memory."
        : "Unlock the full thread and unlimited AI questions.";

  return (
    <div className="rounded-2xl border tl-warn-border tl-warn-bg p-5 text-sm">
      <div className="flex items-start gap-3">
        <Crown className="h-5 w-5 tl-warn-icon shrink-0 mt-0.5" />
        <div className="space-y-3 flex-1">
          <div>
            <p className="font-semibold tl-warn-fg">ThreadLens Premium</p>
            <p className="text-[var(--color-foreground)] mt-1">{copy}</p>
            <ul className="mt-2 text-xs text-[var(--color-muted-foreground)] space-y-1 list-disc list-inside">
              <li>Full chat import (no 35k message cap)</li>
              <li>Unlimited AI questions per day</li>
              <li>Deeper context window for answers</li>
              <li>Enabled manually by email — no card yet</li>
            </ul>
          </div>
          {message && <p className="text-xs text-emerald-800 dark:text-emerald-200/90">{message}</p>}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={status === "sending"}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60"
            >
              <Mail className="h-3.5 w-3.5" />
              {status === "sending" ? "Sending…" : "Request Premium"}
            </button>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=ThreadLens%20Premium`}
              className="inline-flex items-center rounded-lg border border-[var(--color-border)] px-4 py-2 text-xs text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]"
            >
              Email directly
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
