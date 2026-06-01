"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User } from "lucide-react";
import { PremiumBadge } from "@/components/PremiumBadge";
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
        <PremiumBadge />
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
