"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, Upload, Trash2, BarChart3, User } from "lucide-react";
import { useChatStore, useActiveSession, dedupeSessionsByName } from "@/lib/store";
import { getChatStats } from "@/lib/parser";
import { getUseCase } from "@/lib/use-cases";
import { SiteFooter } from "@/components/SiteFooter";
import { AppHeader } from "@/components/AppHeader";
import { useAccount } from "@/hooks/useAccount";

export default function DashboardPage() {
  const router = useRouter();
  const { account } = useAccount();
  const rawSessions = useChatStore((s) => s.sessions);
  const sessions = useMemo(() => dedupeSessionsByName(rawSessions), [rawSessions]);
  const removeSession = useChatStore((s) => s.removeSession);
  const active = useActiveSession();

  const stats = useMemo(
    () => (active?.messages?.length ? getChatStats(active.messages) : null),
    [active]
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-6 pb-24">
      <AppHeader
        title="Your threads"
        subtitle={
          sessions.length === 0
            ? "Import a chat to see patterns and ask questions."
            : `${sessions.length} saved on this device`
        }
      >
        <Link
          href="/upload"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          <Upload className="h-4 w-4" />
          Import chat
        </Link>
      </AppHeader>

      {account?.isPremium && (
        <p className="max-w-4xl mx-auto -mt-4 mb-6 text-sm text-amber-500 dark:text-amber-200/90">
          Premium active — full imports and a high daily AI limit.
        </p>
      )}

      {sessions.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-16 space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8">
          <MessageSquare className="h-12 w-12 text-emerald-400 mx-auto" />
          <h2 className="text-lg font-semibold">No chats yet</h2>
          <p className="text-[var(--color-muted-foreground)] text-sm">
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
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 hover:border-[var(--color-ring)] transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold truncate">{session.name}</h2>
                    <p className="text-xs text-[var(--color-muted-foreground)] capitalize">
                      {uc.emoji} {uc.label} · {session.platform}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSession(session.id)}
                    className="text-[var(--color-muted-foreground)] hover:text-red-400 p-1"
                    aria-label="Remove session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Messages</dt>
                    <dd className="font-medium">{sessionStats.totalMessages.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Most active</dt>
                    <dd className="font-medium truncate">{topSender?.sender ?? "—"}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => router.push(`/chat/${encodeURIComponent(session.id)}`)}
                  className="mt-4 w-full rounded-lg bg-[var(--color-secondary)] py-2 text-sm font-medium hover:bg-[var(--color-accent)] transition-colors text-[var(--color-secondary-foreground)]"
                >
                  Open analysis
                </button>
              </article>
            );
          })}
        </div>
      )}

      {active && stats && (
        <section className="max-w-4xl mx-auto mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              {active.name}
            </h2>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {stats.isOneToOne
                ? "1:1 chat — only the two people who actually messaged"
                : "Messages sent by each participant"}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.primaryBySender.slice(0, 6).map((row) => (
              <div key={row.sender} className="rounded-xl bg-[var(--color-background)] p-4 border border-[var(--color-border)]">
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="h-3.5 w-3.5 text-[var(--color-muted-foreground)] shrink-0" />
                  <p className="font-medium truncate text-sm">{row.sender}</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{row.count.toLocaleString()}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">messages sent · avg {row.avgLength} chars</p>
                {row.sorryCount > 0 && (
                  <p className="text-xs text-amber-400/90 mt-1">{row.sorryCount} sorry-style replies</p>
                )}
              </div>
            ))}
          </div>
          {stats.incidentalSenders.length > 0 && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-4 leading-relaxed">
              {stats.isOneToOne ? (
                <>
                  Names like{" "}
                  {stats.incidentalSenders
                    .slice(0, 4)
                    .map((s) => s.sender)
                    .join(", ")}
                  {stats.incidentalSenders.length > 4 ? "…" : ""} are not other people in this chat —
                  they come from forwarded or pasted snippets inside messages (a few lines each), not
                  real replies.
                </>
              ) : (
                <>
                  {stats.incidentalSenders.length} low-count name
                  {stats.incidentalSenders.length === 1 ? "" : "s"} hidden — likely quoted or
                  forwarded text, not active participants.
                </>
              )}
            </p>
          )}
        </section>
      )}

      <SiteFooter className="max-w-4xl mx-auto mt-12" />
    </div>
  );
}
