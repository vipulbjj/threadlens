"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Upload, Trash2, BarChart3 } from "lucide-react";
import { useChatStore, useActiveSession } from "@/lib/store";
import { getChatStats } from "@/lib/parser";
import { getUseCase } from "@/lib/use-cases";
import { SiteFooter } from "@/components/SiteFooter";

export default function DashboardPage() {
  const router = useRouter();
  const sessions = useChatStore((s) => s.sessions);
  const removeSession = useChatStore((s) => s.removeSession);
  const active = useActiveSession();

  const stats = active ? getChatStats(active.messages) : null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 pb-24">
      <header className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your threads</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {sessions.length === 0
              ? "Import a chat to see patterns and ask questions."
              : `${sessions.length} saved on this device`}
          </p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Import chat
        </Link>
      </header>

      {sessions.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <MessageSquare className="h-12 w-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-semibold">No chats yet</h2>
          <p className="text-zinc-400 text-sm">
            Couples use it before hard talks. Friends use it to see who carries the group chat. Export a thread and drop
            the file.
          </p>
          <Link href="/upload" className="inline-block text-emerald-400 font-medium hover:underline">
            Go to upload
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => {
            const sessionStats = getChatStats(session.messages);
            const topSender = sessionStats.bySender.sort((a, b) => b.count - a.count)[0];
            const uc = getUseCase(session.useCase);
            return (
              <article
                key={session.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-zinc-600 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold truncate">{session.name}</h2>
                    <p className="text-xs text-zinc-500 capitalize">
                      {uc.emoji} {uc.label} · {session.platform}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSession(session.id)}
                    className="text-zinc-500 hover:text-red-400 p-1"
                    aria-label="Remove session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-zinc-500">Messages</dt>
                    <dd className="font-medium">{sessionStats.totalMessages.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Most active</dt>
                    <dd className="font-medium truncate">{topSender?.sender ?? "—"}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => router.push(`/chat/${encodeURIComponent(session.id)}`)}
                  className="mt-4 w-full rounded-lg bg-zinc-800 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
                >
                  Open analysis
                </button>
              </article>
            );
          })}
        </div>
      )}

      {active && stats && (
        <section className="max-w-4xl mx-auto mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            Snapshot: {active.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.bySender.slice(0, 6).map((row) => (
              <div key={row.sender} className="rounded-xl bg-zinc-950/80 p-4 border border-zinc-800">
                <p className="font-medium truncate">{row.sender}</p>
                <p className="text-2xl font-bold text-emerald-400">{row.count}</p>
                <p className="text-xs text-zinc-500">messages · avg {row.avgLength} chars</p>
                {row.sorryCount > 0 && (
                  <p className="text-xs text-amber-400/90 mt-1">{row.sorryCount} sorry-style replies</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <SiteFooter className="max-w-4xl mx-auto mt-12" />
    </div>
  );
}
