import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { USE_CASES } from "@/lib/use-cases";
import { MarketingPageShell } from "@/components/MarketingPageShell";

export default function UseCasesPage() {
  return (
    <MarketingPageShell
      title="Who is this for?"
      subtitle="ThreadLens turns chat exports into patterns you can actually talk about. Pick a lens when you import — stats are instant; AI questions are optional."
    >
      <div className="space-y-6">
        {USE_CASES.map((uc) => (
          <article key={uc.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                {uc.emoji}
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">{uc.label}</h2>
                <p className="text-sm text-emerald-700 dark:text-emerald-400/90 mt-0.5">{uc.tagline}</p>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-3 leading-relaxed">{uc.description}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-[var(--color-muted-foreground)] list-disc list-inside sm:text-xs">
                  {uc.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <p className="text-sm text-[var(--color-foreground)]/90">Ready? Export a chat without media, then drop the .txt or .zip file.</p>
          <Link
            href="/upload"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 min-h-11 touch-manipulation"
          >
            Import a chat
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
