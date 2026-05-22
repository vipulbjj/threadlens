import Link from "next/link";
import { ArrowRight, Shield, Sparkles, MessageCircle } from "lucide-react";
import { HomeSessionsLink } from "@/components/HomeSessionsLink";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.15),transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_0%,rgba(59,130,246,0.08),transparent_50%)]" />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight text-white">ThreadLens</span>
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
          <Link href="#how" className="hover:text-white transition-colors">
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
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Sparkles className="h-3 w-3" />
            Built for group chats and late-night threads
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            See what your chats are{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300 bg-clip-text text-transparent">
              really saying
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
            Drop a WhatsApp, Telegram, or iMessage export. Parsing stays on your phone. AI chat only sends what you ask about.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/upload"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 sm:w-auto"
            >
              Upload a chat export
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-600 bg-zinc-900/80 px-8 py-4 text-base font-medium text-zinc-100 hover:bg-zinc-800 sm:w-auto"
            >
              Open saved threads
            </Link>
          </div>
        </section>

        <section id="how" className="border-t border-zinc-800/80 py-20">
          <h2 className="text-center text-3xl font-bold text-white">How it works</h2>
          <ol className="mx-auto mt-12 max-w-2xl space-y-10 border-l-2 border-emerald-500/40 pl-8">
            {[
              {
                step: "01",
                title: "Export your chat",
                body: "WhatsApp: Chat → Export chat → Without media → .txt. On upload, pick the platform that matches your file.",
              },
              {
                step: "02",
                title: "Stats stay on your device",
                body: "Parsing runs in your browser. We count messages, reply times, and patterns—nothing is uploaded for analytics unless you use AI chat.",
              },
              {
                step: "03",
                title: "Ask questions (optional)",
                body: "Turn on Grok in settings if you want. Only the messages needed for your question are sent to xAI—not your whole export.",
              },
            ].map((item) => (
              <li key={item.step} className="relative">
                <span className="absolute -left-[2.35rem] top-0 text-xs font-bold tabular-nums text-emerald-400">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="py-16">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <Shield className="mt-1 h-6 w-6 shrink-0 text-emerald-400" aria-hidden />
              <div>
                <h3 className="text-lg font-semibold text-white">Privacy, honestly</h3>
                <p className="mt-2 text-sm text-zinc-400 max-w-xl">
                  Parsing is local. AI chat sends message text to xAI when you ask—we do not claim zero-knowledge storage or that your data never hits a database. Read the code and the API route before you trust marketing copy.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-zinc-500">
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

      <footer className="relative z-10 border-t border-zinc-800 py-8 text-center text-sm text-zinc-500">
        ThreadLens · For personal reflection, not therapy or legal advice
      </footer>
    </div>
  );
}
