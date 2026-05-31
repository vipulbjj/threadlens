"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, Crown, User } from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
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
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)] hover:border-emerald-500/50 hover:text-emerald-500"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {account.isPremium ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
          <Crown className="h-3 w-3" />
          Premium
        </span>
      ) : (
        <span className="text-[10px] text-[var(--color-muted-foreground)]">
          AI {account.usage.aiQuestionsToday}/{account.usage.aiLimit < 0 ? "∞" : account.usage.aiLimit} today
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
