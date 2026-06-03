import type { ReactNode } from "react";
import Link from "next/link";
import { Monitor, Server, Sparkles } from "lucide-react";
import { MarketingPageShell } from "@/components/MarketingPageShell";

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-7">
      <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-[var(--color-muted-foreground)] leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <MarketingPageShell
      title="How privacy works"
      subtitle="ThreadLens is built for reflection, not surveillance. Here is exactly what stays on your device and what leaves it — no fine print tricks."
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-600/30 bg-emerald-500/10 px-5 py-4 text-sm leading-relaxed">
          <p className="font-semibold text-[var(--color-foreground)]">The short version</p>
          <p className="mt-2 text-[var(--color-foreground)]/85">
            Your export file is <strong className="text-[var(--color-foreground)]">parsed in your browser</strong>. Pattern
            stats (who texts more, reply gaps, conflict phrases, etc.) are{" "}
            <strong className="text-[var(--color-foreground)]">computed locally</strong> and are not sent to AI. Optional
            Q&amp;A sends a <strong className="text-[var(--color-foreground)]">limited excerpt</strong> of recent messages
            plus summary statistics — only when you sign in and ask.
          </p>
        </div>

        <Section title="What stays on your device">
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong className="text-[var(--color-foreground)]">The export file</strong> (.txt, .json, or .zip) — read
              and parsed in JavaScript in your browser. We do not upload the file to parse it.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Thread insights</strong> — balance, initiation, reply
              speed, repair language, late-night volume, and the rest of the insight cards.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Saved threads</strong> — stored in this browser&apos;s{" "}
              <code className="rounded bg-[var(--color-secondary)] px-1 py-0.5 text-xs">localStorage</code> (trimmed by
              tier so storage does not blow up). Another device or a cleared browser will not have them unless you
              re-import.
            </li>
          </ul>
          <p className="flex items-start gap-2 pt-1">
            <Monitor className="h-4 w-4 shrink-0 tl-accent mt-0.5" aria-hidden />
            <span>You can import and explore insights without creating an account.</span>
          </p>
        </Section>

        <Section title="What optional AI sends (only if you ask)">
          <p>
            If you sign in and submit a question, your browser calls our API on Vercel. That request includes:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Your question (what you typed)</li>
            <li>
              <strong className="text-[var(--color-foreground)]">Summary statistics</strong> computed over the full
              thread (counts, percentages, patterns — not every message verbatim)
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">A capped slice of recent messages</strong> for
              conversational context (not your entire export)
            </li>
          </ul>
          <p className="flex items-start gap-2">
            <Server className="h-4 w-4 shrink-0 tl-accent mt-0.5" aria-hidden />
            <span>
              The server forwards that payload to an AI provider configured in our deployment (e.g. Azure OpenAI or
              xAI). We do not store your full chat history on our servers.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 tl-accent mt-0.5" aria-hidden />
            <span>
              Free accounts: 30 AI questions per UTC day. Premium unlocks higher limits and larger imports — see{" "}
              <Link href="/pricing" className="tl-accent hover:underline">
                pricing
              </Link>
              .
            </span>
          </p>
        </Section>

        <Section title="What we store when you sign in">
          <ul className="list-disc list-inside space-y-2">
            <li>Email and auth identity (via Supabase)</li>
            <li>Premium status and daily AI question count (for rate limits)</li>
          </ul>
          <p>We do not persist your full message export in our database as part of the normal product flow.</p>
        </Section>

        <Section title="What we do not do">
          <ul className="list-disc list-inside space-y-2">
            <li>Sell your chat data</li>
            <li>Train models on your exports</li>
            <li>Require an account to see local pattern stats</li>
            <li>Parse exports on a server by default</li>
          </ul>
        </Section>

        <Section title="Your choices">
          <ul className="list-disc list-inside space-y-2">
            <li>Use insights only — no AI, no sign-in required for import + stats</li>
            <li>Clear site data in your browser to remove saved threads</li>
            <li>Do not use AI if you do not want any message text sent to a model</li>
          </ul>
        </Section>

        <p className="text-xs text-[var(--color-muted-foreground)] text-center leading-relaxed px-2">
          ThreadLens is a reflection tool, not therapy, legal advice, or a way to win arguments. If you are in an unsafe
          situation, talk to someone you trust or a professional — not an app.
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/upload" className="tl-accent font-medium hover:underline">
            Import a chat →
          </Link>
          <Link href="/" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            Home
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
