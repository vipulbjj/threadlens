import Link from "next/link";
import { ArrowRight, Shield, Sparkles, MessageCircle, Heart } from "lucide-react";
import { USE_CASES } from "@/lib/use-cases";
import { SiteFooter } from "@/components/SiteFooter";
import { UserMenu } from "@/components/UserMenu";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(59,130,246,0.08),transparent_50%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight">ThreadLens</span>
        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium text-[var(--color-muted-foreground)]">
          <UserMenu />
          <Link href="/use-cases" className="hover:text-[var(--color-foreground)] transition-colors hidden sm:inline">
            Use cases
          </Link>
          <Link href="#how" className="hover:text-[var(--color-foreground)] transition-colors hidden sm:inline">
            How it works
          </Link>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <section className="pt-8 pb-16 text-center lg:pt-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 dark:text-rose-200">
            <Heart className="h-3 w-3" />
            Free · private · built for real conversations
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Turn messy chats into{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              calmer conversations
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-muted-foreground)]">
            Import a WhatsApp, Telegram, or iMessage export. See balance, conflict patterns, and repair moments—then ask
            guided questions. Parsing stays on your device.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 sm:w-auto"
            >
              Analyze a chat
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-8 py-4 text-base font-medium hover:bg-[var(--color-accent)] sm:w-auto transition-colors"
            >
              Open saved threads
            </Link>
          </div>
          <p className="mt-3 text-center text-sm text-[var(--color-muted-foreground)]">
            No account needed to import — sign in later for AI questions.
          </p>
        </section>

        <section className="py-12">
          <h2 className="text-center text-2xl font-bold mb-8">Who it helps</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((uc) => (
              <Link
                key={uc.id}
                href="/upload"
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 hover:border-emerald-500/40 transition-colors text-left"
              >
                <span className="text-2xl">{uc.emoji}</span>
                <h3 className="mt-2 font-semibold">{uc.label}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{uc.tagline}</p>
              </Link>
            ))}
          </div>
          <p className="text-center mt-6">
            <Link href="/use-cases" className="text-sm text-emerald-400 hover:underline">
              Read all use cases →
            </Link>
          </p>
        </section>

        <section id="how" className="border-t border-[var(--color-border)] py-20">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <ol className="mx-auto mt-12 max-w-2xl space-y-10 border-l-2 border-emerald-500/40 pl-8">
            {[
              {
                step: "01",
                title: "Export your chat",
                body: "WhatsApp: Chat \u2192 Export chat \u2192 Without media. Pick your platform and lens (couples, friends, work, etc.) on upload.",
              },
              {
                step: "02",
                title: "Instant insights on-device",
                body: "Who texts more, apology patterns, conflict markers, late-night spikes\u2014computed in your browser. No account required.",
              },
              {
                step: "03",
                title: "Guided questions (optional)",
                body: "Tap prompts like \u201cWhat triggers our fights?\u201d or ask your own. Sign in for AI (30 free questions/day). Uses your xAI key on the server\u2014only recent messages are sent.",
              },
            ].map((item) => (
              <li key={item.step} className="relative">
                <span className="absolute -left-[2.35rem] top-0 text-xs font-bold tabular-nums text-emerald-400">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)] leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-16">
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-1 h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
              <div>
                <h3 className="text-lg font-semibold">Privacy, honestly</h3>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)] max-w-xl">
                  Parsing is local. Optional AI (xAI on the server) sends only the messages needed for your question. Premium
                  unlocks full imports and unlimited AI via email. Not therapy, legal, or relationship advice.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[var(--color-muted-foreground)]">
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" /> Local parsing
              </span>
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Optional AI (xAI)
              </span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
