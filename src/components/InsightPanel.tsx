"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import type { ThreadInsight } from "@/lib/insights";

const severityStyles: Record<ThreadInsight["severity"], string> = {
  neutral: "border-[var(--color-border)] bg-[var(--color-card)]",
  note: "border-amber-500/40 bg-amber-500/10",
  highlight: "border-emerald-500/40 bg-emerald-500/10",
};

const severityDot: Record<ThreadInsight["severity"], string> = {
  neutral: "bg-zinc-500",
  note: "bg-amber-400",
  highlight: "bg-emerald-400",
};

function InsightCard({ insight }: { insight: ThreadInsight }) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${severityStyles[insight.severity]}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${severityDot[insight.severity]}`} aria-hidden />
        <div className="min-w-0">
          <p className="font-medium text-[var(--color-foreground)] text-sm leading-snug">{insight.title}</p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">{insight.detail}</p>
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
  const primary = metrics.filter((i) => i.id !== "volume").slice(0, 3);
  const extra = metrics.filter((i) => i.id !== "volume").slice(3);
  const [showAll, setShowAll] = useState(extra.length <= 2);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h2>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">Computed on your device — not sent to AI</p>
        </div>
        {extra.length > 2 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 shrink-0"
          >
            {showAll ? "Show less" : `Show all (${metrics.length})`}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {headline && (
          <p className="text-sm text-[var(--color-foreground)]">
            <span className="text-[var(--color-muted-foreground)]">Overview · </span>
            {headline.detail}
          </p>
        )}

        {primary.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {primary.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {showAll && extra.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {extra.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}

        {!showAll && extra.length > 0 && (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {extra.length} more signals hidden — expand to see repair language, tension markers, and more.
          </p>
        )}
      </div>

      {disclaimer && (
        <aside className="flex gap-2.5 border-t border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3 text-xs text-[var(--color-muted-foreground)] leading-relaxed">
          <Info className="h-4 w-4 shrink-0 text-amber-400/90 mt-0.5" aria-hidden />
          <p>
            <span className="font-medium text-[var(--color-foreground)]">Before you decide anything. </span>
            {disclaimer.detail.replace(/^Stats and AI reads[^.]*\.\s*/i, "")}
          </p>
        </aside>
      )}
    </section>
  );
}
