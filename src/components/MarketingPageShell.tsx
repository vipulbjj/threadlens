import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNavActions } from "@/components/SiteNavActions";
import { SiteFooter } from "@/components/SiteFooter";

export function MarketingPageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] pb-24">
      <header className="mx-auto max-w-3xl px-4 py-6 flex items-start justify-between gap-4 sm:px-6 sm:py-8">
        <div className="min-w-0 flex-1">
          <Link href="/" className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            ← ThreadLens
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-sm text-[var(--color-muted-foreground)] leading-relaxed sm:text-base">{subtitle}</p> : null}
        </div>
        <SiteNavActions />
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  );
}
