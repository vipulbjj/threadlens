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
    return <span className="text-xs text-zinc-500">…</span>;
  }

  if (!account?.authenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-200"
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
        <span className="text-[10px] text-zinc-500">
          AI {account.usage.aiQuestionsToday}/{account.usage.aiLimit < 0 ? "∞" : account.usage.aiLimit} today
        </span>
      )}
      <Link href="/account" className="text-xs text-zinc-400 hover:text-zinc-200 truncate max-w-[8rem]" title={account.email}>
        <User className="h-4 w-4 inline mr-1" />
        {account.email?.split("@")[0]}
      </Link>
      <button type="button" onClick={() => void signOut()} className="text-zinc-500 hover:text-zinc-200 p-1" aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
