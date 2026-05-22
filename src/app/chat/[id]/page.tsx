"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, BarChart3, ArrowLeft } from "lucide-react";
import { useChatStore, useActiveSession } from "@/lib/store";
import { getChatStats } from "@/lib/parser";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const params = useParams();
  const sessionId = decodeURIComponent((params.id as string) || "");
  const session = useChatStore((s) => s.sessions.find((x) => x.id === sessionId));
  const setActiveSession = useChatStore((s) => s.setActiveSession);

  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([
    {
      role: "assistant",
      content: session
        ? `Loaded **${session.name}** (${session.messages.length} messages, ${session.platform}). Ask anything about tone, red flags, who texts more, or what to say next. Only the messages in this thread are sent to the AI when you ask.`
        : "Session not found. Go back to the dashboard and import a chat.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) setActiveSession(sessionId);
  }, [sessionId, setActiveSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const stats = session ? getChatStats(session.messages) : null;

  const handleSend = async () => {
    if (!input.trim() || loading || !session) return;
    const userMessage = input.trim();
    setInput("");
    setChatHistory((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: session.messages, question: userMessage }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Chat request failed");
      }
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Check your API key in .env and try again.");
      setChatHistory((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
        <p className="text-zinc-400 mb-4">This chat is not on this device anymore.</p>
        <Link href="/dashboard" className="text-emerald-400 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      <header className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3 shrink-0">
        <Link href="/dashboard" className="text-zinc-400 hover:text-zinc-200" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold truncate">{session.name}</h1>
          <p className="text-xs text-zinc-500 capitalize">{session.platform} · {session.messages.length} messages</p>
        </div>
        <Link
          href={`/dashboard`}
          className="text-zinc-400 hover:text-emerald-400"
          title="Stats on dashboard"
        >
          <BarChart3 className="h-5 w-5" />
        </Link>
      </header>

      {stats && (
        <div className="shrink-0 border-b border-zinc-800/80 px-4 py-2 flex gap-4 overflow-x-auto text-xs text-zinc-400">
          <span>{stats.totalMessages} msgs</span>
          <span>Most from {stats.bySender[0]?.sender ?? "—"}</span>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user" ? "ml-auto bg-emerald-600 text-white" : "mr-auto bg-zinc-800 text-zinc-100"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="text-sm text-zinc-500 animate-pulse">Thinking…</div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="shrink-0 border-t border-zinc-800 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about this thread…"
            className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            disabled={loading}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-xl bg-emerald-500 px-4 py-3 text-zinc-950 font-semibold hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2 text-center">
          AI replies use your xAI key. Message text is sent to the API; we do not store chats on a server database.
        </p>
      </footer>
    </div>
  );
}
