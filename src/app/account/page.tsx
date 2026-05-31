"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { PremiumUpsell } from "@/components/PremiumUpsell";
import { UserMenu } from "@/components/UserMenu";
import { Crown } from "lucide-react";
import { useAccount } from "@/hooks/useAccount";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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
      <div className="min-h-screen bg-zinc-950 p-6 max-w-lg mx-auto">
        <AuthForm mode="login" />
      </div>
    );
  }

  if (loading || !account?.authenticated) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 pb-24">
      <div className="max-w-lg mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Dashboard
          </Link>
          <UserMenu />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="text-sm text-zinc-400 mt-1">{account.email}</p>
          {account.isPremium ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-sm font-medium text-amber-200">
              <Crown className="h-4 w-4" />
              Premium active — full imports & high daily AI limit
            </p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Free plan · {account.usage.aiQuestionsToday} / {account.usage.aiLimit} AI questions used today
            </p>
          )}
        </div>

        {!account.isPremium && <PremiumUpsell reason="general" email={account.email} />}

        <form onSubmit={(e) => void updatePassword(e)} className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <h2 className="font-semibold">Set new password</h2>
          <p className="text-xs text-zinc-500">Use this after opening the reset link from your email.</p>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-sm"
          />
          {pwErr && <p className="text-sm text-red-300">{pwErr}</p>}
          {pwMsg && <p className="text-sm text-emerald-300">{pwMsg}</p>}
          <button type="submit" className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700">
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
