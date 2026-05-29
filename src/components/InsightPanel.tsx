"use client";

import type { ThreadInsight } from "@/lib/insights";

const severityStyles: Record<ThreadInsight["severity"], string> = {
  neutral: "border-zinc-800 bg-zinc-900/50",
  note: "border-amber-500/30 bg-amber-500/5",
  highlight: "border-emerald-500/30 bg-emerald-500/5",
};

export function InsightPanel({ insights, title = "Thread insights" }: { insights: ThreadInsight[]; title?: string }) {
  if (insights.length === 0) return null;

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-3">
      <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">{title}</h2>
      <ul className="space-y-2">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className={`rounded-xl border px-4 py-3 ${severityStyles[insight.severity]}`}
          >
            <p className="font-medium text-zinc-100 text-sm">{insight.title}</p>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{insight.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
