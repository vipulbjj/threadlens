"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { PremiumBadge } from "@/components/PremiumBadge";
import { useAccount } from "@/hooks/useAccount";
import { formatAiQuotaCompact, formatAiQuotaTitle } from "@/lib/usage-copy";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const { account, loading, refresh } = useAccount();
  const router = useRouter();
  const authOn = isSupabaseConfigured();

  if (!authOn) return null;

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await refresh();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <span className="text-xs text-[var(--color-muted-foreground)]">…</span>;
  }

  if (!account?.authenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-emerald-600/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200 hover:border-emerald-500/60 hover:bg-emerald-500/15"
      >
        <LogIn className="h-4 w-4 shrink-0" aria-hidden />
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {account.isPremium ? (
        <PremiumBadge />
      ) : (
        <span
          className="max-w-[9rem] truncate text-[10px] font-medium leading-tight text-[var(--color-muted-foreground)] sm:max-w-[11rem]"
          title={formatAiQuotaTitle(account.usage.aiQuestionsToday, account.usage.aiLimit)}
        >
          {formatAiQuotaCompact(account.usage.aiQuestionsToday, account.usage.aiLimit)}
        </span>
      )}
      <Link href="/account" className="text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] truncate max-w-[8rem]" title={account.email}>
        <User className="h-4 w-4 inline mr-1" />
        {account.email?.split("@")[0]}
      </Link>
      <button type="button" onClick={() => void signOut()} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] p-1" aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
