"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AuthMode = "login" | "signup" | "forgot";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
        Auth is not configured yet. Add <code className="text-emerald-400">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-emerald-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to Vercel. You can still parse chats
        without signing in.
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();
    const origin = window.location.origin;

    try {
      if (mode === "forgot") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/account`,
        });
        if (err) throw err;
        setInfo("Check your email for a password reset link.");
        return;
      }

      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback?next=/dashboard` },
        });
        if (err) throw err;
        setInfo("Check your email to confirm your account, then sign in.");
        return;
      }

      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw err;
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Reset password";

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-sm text-zinc-400 mt-2">
          {mode === "login" && "Free tier: 30 AI questions per day. Premium via email."}
          {mode === "signup" && "Parsing stays on your device. Sign in to use AI."}
          {mode === "forgot" && "We'll email you a link to set a new password."}
        </p>
      </div>

      <form onSubmit={(e) => void submit(e)} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <label className="block text-sm">
          <span className="text-zinc-400">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </label>
        {mode !== "forgot" && (
          <label className="block text-sm">
            <span className="text-zinc-400">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-950 border border-zinc-700 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </label>
        )}
        {error && <p className="text-sm text-red-300">{error}</p>}
        {info && <p className="text-sm text-emerald-300">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {loading ? "Please wait…" : title}
        </button>
      </form>

      <p className="text-center text-xs text-zinc-500">
        {mode === "login" && (
          <>
            <Link href="/signup" className="text-emerald-400 hover:underline">
              Create account
            </Link>
            {" · "}
            <Link href="/forgot-password" className="text-emerald-400 hover:underline">
              Forgot password?
            </Link>
          </>
        )}
        {mode === "signup" && (
          <Link href="/login" className="text-emerald-400 hover:underline">
            Already have an account?
          </Link>
        )}
        {mode === "forgot" && (
          <Link href="/login" className="text-emerald-400 hover:underline">
            Back to sign in
          </Link>
        )}
      </p>
    </div>
  );
}
