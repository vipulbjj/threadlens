import Link from "next/link";
import { Crown } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="mx-auto max-w-3xl px-6 py-8 flex justify-between items-center">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300">
          ← ThreadLens
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-16">
        <h1 className="text-3xl font-bold">Free vs Premium</h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          ThreadLens is free for reach. Premium is enabled manually by email while we keep payments simple.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 p-6">
            <h2 className="font-semibold text-lg">Free</h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>Local parsing & insights</li>
              <li>Last 12,000 messages per import (with warning)</li>
              <li>12 AI questions per day (signed in)</li>
              <li>Up to 80 MB export files</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-300" />
              Premium
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-300">
              <li>Full chat import — no message cap</li>
              <li>Unlimited AI questions</li>
              <li>Larger context for answers</li>
              <li>Up to 200 MB exports</li>
            </ul>
            <Link
              href="/account"
              className="mt-6 inline-block rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
            >
              Request Premium
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
