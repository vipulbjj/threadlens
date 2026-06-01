"use client";

import React from "react";
import { Info } from "lucide-react";
import type { ThreadInsight } from "@/lib/insights";

const severityStyles: Record<ThreadInsight["severity"], string> = {
  neutral: "border-[var(--color-border)] bg-[var(--color-card)]",
  note: "tl-warn-border tl-warn-bg",
  highlight: "border-emerald-600/35 bg-emerald-500/12 dark:border-emerald-500/40 dark:bg-emerald-500/10",
};

const severityDot: Record<ThreadInsight["severity"], string> = {
  neutral: "bg-[var(--color-muted-foreground)]/60",
  note: "bg-[var(--tl-warn-icon)]",
  highlight: "bg-emerald-700 dark:bg-emerald-400",
};

/** Bold numeric tokens (e.g. "138,993") inside a plain string */
function boldNumbers(text: string): React.ReactNode {
  const parts = text.split(/(\d[\d,]*(?:\.\d+)?%?)/);
  return parts.map((part, i) =>
    /^\d[\d,]*(?:\.\d+)?%?$/.test(part) ? (
      <strong key={i} className="font-semibold text-[var(--color-foreground)]">{part}</strong>
    ) : (
      part
    )
  );
}

function InsightCard({ insight }: { insight: ThreadInsight }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${severityStyles[insight.severity]}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-[5px] h-2 w-2 shrink-0 rounded-full ${severityDot[insight.severity]}`} aria-hidden />
        <div className="min-w-0">
          <p className="font-medium text-[var(--color-foreground)] text-sm leading-snug">{insight.title}</p>
          <p className="text-sm text-[var(--color-foreground)]/80 mt-0.5 leading-relaxed">{boldNumbers(insight.detail)}</p>
        </div>
      </div>
    </div>
  );
}

export function InsightPanel({
  insights,
  title = "Thread insights",
}: {
  insights: ThreadInsight[];
  title?: string;
}) {
  if (insights.length === 0) return null;

  const disclaimer = insights.find((i) => i.id === "disclaimer");
  const metrics = insights.filter((i) => i.id !== "disclaimer");
  const headline = metrics.find((i) => i.id === "volume");
  const cards = metrics.filter((i) => i.id !== "volume");

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)]">
        <h2 className="text-base font-semibold text-[var(--color-foreground)] sm:text-sm">{title}</h2>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5 sm:text-xs">Computed on your device — not sent to AI</p>
      </div>

      <div className="p-4 space-y-3">
        {headline && (
          <p className="text-[13px] text-[var(--color-muted-foreground)]">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted-foreground)]/60 mr-1.5">
              Overview
            </span>
            {boldNumbers(headline.detail)}
          </p>
        )}

        {cards.length > 0 && (
          <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>

      {disclaimer && (
        <aside className="flex gap-2.5 border-t border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3.5 text-sm text-[var(--color-muted-foreground)] leading-relaxed sm:text-xs">
          <Info className="h-4 w-4 shrink-0 tl-warn-icon mt-0.5" aria-hidden />
          <p>
            <span className="font-medium text-[var(--color-foreground)]">Before you decide anything. </span>
            {disclaimer.detail.replace(/^Stats and AI reads[^.]*\.\s*/i, "")}
          </p>
        </aside>
      )}
    </section>
  );
}
