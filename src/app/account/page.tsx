"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { PremiumUpsell } from "@/components/PremiumUpsell";
import { SiteNavActions } from "@/components/SiteNavActions";
import { PremiumBadge } from "@/components/PremiumBadge";
import { useAccount } from "@/hooks/useAccount";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatAiQuotaDetail } from "@/lib/usage-copy";

export default function AccountPage() {
  const { account, loading, refresh } = useAccount();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && account?.authEnabled && !account.authenticated) {
      router.replace("/login");
    }
  }, [account, loading, router]);

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setPwErr(error.message);
    else {
      setPwMsg("Password updated.");
      setPassword("");
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-6 pb-24 max-w-lg mx-auto">
        <AuthForm mode="login" />
      </div>
    );
  }

  if (loading || !account?.authenticated) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center text-[var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] px-4 py-6 pb-24 sm:p-6">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            ← Dashboard
          </Link>
          <SiteNavActions />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1 break-all">{account.email}</p>
          {account.isPremium ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PremiumBadge />
              <span className="text-sm tl-warn-fg">Full imports and high daily AI limit</span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              {formatAiQuotaDetail(account.usage.aiQuestionsToday, account.usage.aiLimit)}
            </p>
          )}
        </div>

        {!account.isPremium && <PremiumUpsell reason="general" email={account.email} />}

        <form
          onSubmit={(e) => void updatePassword(e)}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 space-y-4"
        >
          <h2 className="font-semibold">Set new password</h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">Use this after opening the reset link from your email.</p>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          {pwErr && <p className="text-sm text-red-800 dark:text-red-300">{pwErr}</p>}
          {pwMsg && <p className="text-sm text-emerald-800 dark:text-emerald-300">{pwMsg}</p>}
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--color-accent)] min-h-11 touch-manipulation"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
