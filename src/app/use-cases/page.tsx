import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { USE_CASES } from "@/lib/use-cases";
import { SiteFooter } from "@/components/SiteFooter";

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← ThreadLens
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Who is this for?</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          ThreadLens turns chat exports into patterns you can actually talk about. Pick a lens when you import — stats
          are instant; AI questions are optional.
        </p>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16 space-y-6">
        {USE_CASES.map((uc) => (
          <article key={uc.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>
                {uc.emoji}
              </span>
              <div>
                <h2 className="text-lg font-semibold">{uc.label}</h2>
                <p className="text-sm text-emerald-400/90 mt-0.5">{uc.tagline}</p>
                <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{uc.description}</p>
                <ul className="mt-4 space-y-1.5 text-xs text-zinc-500 list-disc list-inside">
                  {uc.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}

        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <p className="text-sm text-zinc-300">Ready? Export a chat without media, then drop the .txt file.</p>
          <Link
            href="/upload"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
          >
            Import a chat
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
