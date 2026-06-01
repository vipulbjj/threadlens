import Link from "next/link";
import { Crown } from "lucide-react";
import { MarketingPageShell } from "@/components/MarketingPageShell";

export default function PricingPage() {
  return (
    <MarketingPageShell
      title="Free vs Premium"
      subtitle="ThreadLens is free for reach. Premium is enabled manually by email while we keep payments simple."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <h2 className="font-semibold text-lg">Free</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            <li>Local parsing & insights</li>
            <li>Last 35,000 messages per import (with warning)</li>
            <li>30 AI questions per day (signed in)</li>
            <li>Up to 100 MB export files</li>
          </ul>
        </div>
        <div className="rounded-2xl border tl-warn-border tl-warn-bg p-6">
          <h2 className="font-semibold text-lg flex items-center gap-2 tl-warn-fg">
            <Crown className="h-5 w-5 tl-warn-icon" />
            Premium
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--color-foreground)]/90">
            <li>Full chat import — no message cap</li>
            <li>Unlimited AI questions</li>
            <li>Larger context for answers</li>
            <li>Very large exports (up to ~512 MB — device memory is the limit)</li>
          </ul>
          <Link
            href="/account"
            className="mt-6 inline-block rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Request Premium
          </Link>
        </div>
      </div>
    </MarketingPageShell>
  );
}
