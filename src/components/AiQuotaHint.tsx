"use client";

import Link from "next/link";
import type { UsageSnapshot } from "@/lib/usage";
import { formatAiQuotaDetail, formatAiQuotaTitle } from "@/lib/usage-copy";

/** Visible free-tier AI quota — avoids cryptic "2/30" labels. */
export function AiQuotaHint({
  usage,
  variant = "footer",
}: {
  usage: UsageSnapshot;
  variant?: "footer" | "inline";
}) {
  if (usage.isPremium) return null;

  const detail = formatAiQuotaDetail(usage.aiQuestionsToday, usage.aiLimit);
  const title = formatAiQuotaTitle(usage.aiQuestionsToday, usage.aiLimit);
  const exhausted = !usage.canAskAi;

  if (variant === "inline") {
    return (
      <p className="text-[10px] text-[var(--color-muted-foreground)] text-center leading-snug" title={title}>
        {detail}{" "}
        <Link href="/pricing" className="tl-warn-muted hover:underline">
          Premium
        </Link>
      </p>
    );
  }

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${
        exhausted
          ? "border-amber-600/35 bg-amber-500/10 text-[var(--color-foreground)]"
          : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]"
      }`}
      title={title}
    >
      <p className={exhausted ? "font-medium tl-warn-fg" : "text-[var(--color-foreground)]"}>
        {exhausted ? "Daily AI limit reached" : "Free plan AI allowance"}
      </p>
      <p className="mt-0.5">{detail}</p>
      {exhausted ? (
        <Link href="/pricing" className="mt-2 inline-block font-medium tl-accent hover:underline">
          See Premium →
        </Link>
      ) : null}
    </div>
  );
}
