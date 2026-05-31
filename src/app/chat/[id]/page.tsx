"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeProvider";
import { useChatStore } from "@/lib/store";
import { buildThreadInsights, buildFullThreadStats } from "@/lib/insights";
import { getPromptsForUseCase } from "@/lib/prompts";
import { getUseCase } from "@/lib/use-cases";
import { InsightPanel } from "@/components/InsightPanel";
import { useAccount } from "@/hooks/useAccount";
import { PremiumUpsell } from "@/components/PremiumUpsell";
import { UserMenu } from "@/components/UserMenu";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
  const [showInsights, setShowInsights] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const { account, refresh: refreshAccount } = useAccount();
  const bottomRef = useRef<HTMLDivElement>(null);
  const authRequired = isSupabaseConfigured();

  useEffect(() => {
    if (sessionId) setActiveSession(sessionId);
  }, [sessionId, setActiveSession]);

  useEffect(() => {
    if (!session) return;
    setChatHistory([
      {
        role: "assistant",
        content: `Loaded **${session.name}** — ${session.messages.length.toLocaleString()} messages, lens: **${useCaseMeta.label}**.\n\nStats (reply speed, balance, dismissive counts) are computed from your full thread and always included.\n\nTap a prompt or ask anything.`,
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

    if (authRequired && !account?.authenticated) {
      setError("Sign in to ask AI questions (30 free per day).");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: session.messages,
          question: userMessage,
          useCase: session.useCase,
          threadStats: buildFullThreadStats(session.messages, session.useCase),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "quota_exceeded") {
          setQuotaExceeded(true);
        }
        throw new Error(data.error || "Chat request failed");
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
        <Link href="/dashboard" className="text-emerald-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--color-background)] text-[var(--color-foreground)] pb-16 md:pb-0">
      <header className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 shrink-0">
        <Link href="/dashboard" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold truncate">{session.name}</h1>
          <p className="text-xs text-[var(--color-muted-foreground)] capitalize">
            {useCaseMeta.emoji} {useCaseMeta.label} · {session.platform} · {session.messages.length.toLocaleString()} msgs
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInsights((v) => !v)}
          className="text-xs text-[var(--color-muted-foreground)] hover:text-emerald-400 px-2.5 py-1 rounded-md border border-[var(--color-border)] hover:border-emerald-400/40 transition-colors"
        >
          {showInsights ? "Hide signals" : "Show signals"}
        </button>
        <ThemeToggle />
        <UserMenu />
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {showInsights && <InsightPanel insights={insights} />}

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
        {loading && <div className="text-sm text-[var(--color-muted-foreground)] animate-pulse">Thinking…</div>}
        {quotaExceeded && <PremiumUpsell reason="quota" email={account?.email} />}

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
            {error.includes("Sign in") && (
              <Link href="/login" className="block mt-2 text-emerald-400 text-xs hover:underline">
                Sign in →
              </Link>
            )}
            <p className="text-xs text-[var(--color-muted-foreground)] mt-2">You can still use thread insights above without AI.</p>
          </div>
        )}

        {authRequired && account?.authenticated && !account.isPremium && (
          <p className="text-[10px] text-[var(--color-muted-foreground)] text-center">
            Free AI: {account.usage.aiQuestionsToday}/{account.usage.aiLimit} today ·{" "}
            <Link href="/pricing" className="text-amber-500/80 hover:underline">
              Premium
            </Link>
          </p>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-background)] p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-[var(--color-muted-foreground)] mb-2">Suggested questions</p>
          <div className="flex flex-wrap gap-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={loading}
                onClick={() => void ask(p.question)}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1.5 text-xs text-[var(--color-muted-foreground)] hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-200 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void ask(input)}
            placeholder="Ask about this thread…"
            className="flex-1 rounded-xl bg-[var(--color-input)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => void ask(input)}
            disabled={loading || !input.trim()}
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
