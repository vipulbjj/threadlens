"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft, Key } from "lucide-react";
import { SiteNavActions } from "@/components/SiteNavActions";
import { useChatStore } from "@/lib/store";
import { buildThreadInsights, buildFullThreadStats } from "@/lib/insights";
import { getPromptsForUseCase } from "@/lib/prompts";
import { getUseCase } from "@/lib/use-cases";
import { InsightPanel } from "@/components/InsightPanel";
import { useAccount } from "@/hooks/useAccount";
import { PremiumUpsell } from "@/components/PremiumUpsell";
import { AiQuotaHint } from "@/components/AiQuotaHint";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { sliceMessagesForAiPayload } from "@/lib/ai-guard";
import { tierFromPremium, readCachedTier } from "@/lib/tiers";
import { ByokDialog, ByokBadge } from "@/components/ByokDialog";
import { useByokStore } from "@/lib/byok-store";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function renderMd(text: string): React.ReactNode {
  return text.split("\n").map((line, li, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
    const nodes = parts.map((part, pi) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={pi} className="font-semibold">{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={pi}>{part.slice(1, -1)}</em>;
      if (part.startsWith("`") && part.endsWith("`"))
        return <code key={pi} className="rounded bg-[var(--color-secondary)] px-1 font-mono text-[11px]">{part.slice(1, -1)}</code>;
      return part;
    });
    return (
      <span key={li}>
        {nodes}
        {li < arr.length - 1 && <br />}
      </span>
    );
  });
}

export default function ChatPage() {
  const params = useParams();
  const sessionId = decodeURIComponent((params.id as string) || "");
  const session = useChatStore((s) => s.sessions.find((x) => x.id === sessionId));
  const setActiveSession = useChatStore((s) => s.setActiveSession);

  const useCaseMeta = getUseCase(session?.useCase);
  const insights = useMemo(
    () => (session ? buildThreadInsights(session.messages, session.useCase) : []),
    [session]
  );
  const prompts = getPromptsForUseCase(session?.useCase);

  const [input, setInput] = useState("");
  const [showByok, setShowByok] = useState(false);
  /** Collapsed by default on phones so chat + sign-in stay in view (insights are long). */
  const [showInsights, setShowInsights] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  );
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const { account, loading: accountLoading, refresh: refreshAccount } = useAccount();
  const bottomRef = useRef<HTMLDivElement>(null);
  const authRequired = isSupabaseConfigured();
  const byokConfig = useByokStore((s) => s.config);
  // When user has their own key, they bypass sign-in requirement
  const needsSignIn = authRequired && !byokConfig && !accountLoading && !account?.authenticated;

  useEffect(() => {
    if (sessionId) setActiveSession(sessionId);
  }, [sessionId, setActiveSession]);

  useEffect(() => {
    if (!session) return;
    setChatHistory([
      {
        role: "assistant",
        content: `Loaded **${session.name}** — ${session.messages.length.toLocaleString()} msgs, lens: **${useCaseMeta.label}**.\n\nPattern stats (reply speed, who texts more, dismissive counts) are computed from your **full thread** and always included. For conversation context, the AI reads recent messages as text — enough for tone and current themes.`,
      },
    ]);
  }, [session?.id, session?.messages.length, session?.name, useCaseMeta.label]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const ask = async (question: string) => {
    if (!question.trim() || loading || !session) return;
    const userMessage = question.trim();
    setInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setError(null);
    setQuotaExceeded(false);

    // Only block on auth once we know the auth state — account is null while /api/me is loading
    if (authRequired && !accountLoading && !account?.authenticated) {
      setError("Sign in to ask AI questions (30 free per day).");
      setLoading(false);
      return;
    }

    try {
      const tier = account ? tierFromPremium(account.isPremium) : readCachedTier();
      const res = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: sliceMessagesForAiPayload(session.messages, tier),
          totalMessageCount: session.messages.length,
          question: userMessage,
          useCase: session.useCase,
          threadStats: buildFullThreadStats(session.messages, session.useCase),
          // BYOK: pass key client-side, never stored server-side
          ...(byokConfig ? {
            byokApiKey: byokConfig.apiKey,
            byokProvider: byokConfig.provider,
            byokModel: byokConfig.model,
          } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "quota_exceeded") {
          setQuotaExceeded(true);
        }
        const parts = [data.error || "Chat request failed"];
        if (typeof data.code === "string" && data.code) parts.push(`[${data.code}]`);
        if (typeof data.detail === "string" && data.detail.trim()) parts.push(data.detail);
        throw new Error(parts.join(" — "));
      }
      if (data.provider) setAiProvider(data.provider);
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
      void refreshAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. AI may be unavailable — stats still work offline.");
      setChatHistory((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center p-6">
        <p className="text-[var(--color-muted-foreground)] mb-4">This chat is not on this device anymore.</p>
        <Link href="/dashboard" className="tl-accent hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] min-h-0 bg-[var(--color-background)] text-[var(--color-foreground)] pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      {showByok && <ByokDialog onClose={() => setShowByok(false)} />}
      <header className="flex items-center gap-2 border-b border-[var(--color-border)] px-3 py-2.5 shrink-0 sm:gap-3 sm:px-4 sm:py-3">
        <Link href="/dashboard" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] shrink-0 p-1" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold truncate text-sm sm:text-base">{session.name}</h1>
          <p className="text-[11px] text-[var(--color-muted-foreground)] capitalize sm:text-xs">
            {useCaseMeta.emoji} {useCaseMeta.label} · {session.messages.length.toLocaleString()} msgs
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInsights((v) => !v)}
          className="shrink-0 text-xs text-[var(--color-muted-foreground)] hover:text-emerald-700 dark:hover:text-emerald-400 min-h-10 px-2.5 py-2 rounded-md border border-[var(--color-border)] hover:border-emerald-500/40 transition-colors sm:px-2.5 sm:py-1"
        >
          <span className="hidden sm:inline">{showInsights ? "Hide signals" : "Signals"}</span>
          <span className="sm:hidden">{showInsights ? "Hide" : "Stats"}</span>
        </button>
        <ByokBadge onClick={() => setShowByok(true)} />
        <button
          type="button"
          onClick={() => setShowByok(true)}
          title="Use your own API key"
          className="shrink-0 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] min-h-10 px-2 py-2 rounded-md border border-[var(--color-border)] hover:border-emerald-500/40 transition-colors"
        >
          <Key className="h-4 w-4" />
        </button>
        <SiteNavActions />
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {showInsights ? (
          <InsightPanel insights={insights} />
        ) : (
          <button
            type="button"
            onClick={() => setShowInsights(true)}
            className="w-full rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 text-left text-sm text-[var(--color-muted-foreground)] hover:border-emerald-500/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <span className="font-medium text-[var(--color-foreground)]">Thread insights</span>
            <span className="block text-xs mt-0.5">
              {insights.length} signals computed on your device — tap to expand
            </span>
          </button>
        )}

        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user"
                ? "ml-auto max-w-[85%] bg-emerald-600 text-white"
                : i === 0
                  ? "mr-auto max-w-full border border-[var(--color-border)] bg-transparent text-[var(--color-muted-foreground)]"
                  : "mr-auto max-w-[85%] bg-[var(--color-secondary)] text-[var(--color-foreground)]"
            }`}
          >
            {renderMd(msg.content)}
          </div>
        ))}
        {loading && (
          <div className="mr-auto flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[var(--color-secondary)] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted-foreground)] animate-[typing-dot_1.2s_ease-in-out_infinite]" style={{animationDelay:"0ms"}}/>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted-foreground)] animate-[typing-dot_1.2s_ease-in-out_infinite]" style={{animationDelay:"200ms"}}/>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted-foreground)] animate-[typing-dot_1.2s_ease-in-out_infinite]" style={{animationDelay:"400ms"}}/>
          </div>
        )}
        {quotaExceeded && (
          <PremiumUpsell
            reason="quota"
            email={account?.email}
            aiUsedToday={account?.usage.aiQuestionsToday}
            aiLimitToday={account?.usage.aiLimit}
          />
        )}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200">
            {error}
            {error.includes("Sign in") && (
              <Link href="/login" className="block mt-2 tl-accent text-xs hover:underline">
                Sign in →
              </Link>
            )}
            <p className="text-xs text-[var(--color-muted-foreground)] mt-2">You can still use thread insights above without AI.</p>
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-background)] p-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4">
        {account?.authenticated && !account.isPremium && (
          <AiQuotaHint usage={account.usage} variant="footer" />
        )}

        {needsSignIn && (
          <div className="rounded-xl border border-emerald-600/35 bg-emerald-500/10 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">Sign in to ask AI questions</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                Stats above work offline · 30 free AI questions per day when signed in
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Sign in free
            </Link>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {prompts.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={loading || needsSignIn}
              onClick={() => void ask(p.question)}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-xs text-[var(--color-foreground)]/80 transition-colors hover:border-emerald-500/60 hover:bg-emerald-500/8 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-10 touch-manipulation"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void ask(input)}
            placeholder={needsSignIn ? "Sign in above to ask AI…" : "Ask about this thread…"}
            className="flex-1 rounded-xl bg-[var(--color-input)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            disabled={loading || needsSignIn}
          />
          <button
            type="button"
            onClick={() => void ask(input)}
            disabled={loading || needsSignIn || !input.trim()}
            className="rounded-xl bg-emerald-500 px-4 py-3 text-zinc-950 font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[var(--color-muted-foreground)]/60 text-center leading-snug">
          Stats from all {session.messages.length.toLocaleString()} msgs · AI reads last ~{account?.isPremium ? "500" : "350"} · Not therapy
        </p>
      </footer>
    </div>
  );
}
