import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNavActions } from "@/components/SiteNavActions";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  children?: ReactNode;
}

export function AppHeader({ title, subtitle, backHref, children }: AppHeaderProps) {
  return (
    <header className="max-w-4xl mx-auto flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {backHref ? (
          <Link href={backHref} className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] shrink-0 mt-1">
            ←
          </Link>
        ) : null}
        <div className="min-w-0">
          {title ? <h1 className="text-2xl font-bold tracking-tight">{title}</h1> : null}
          {subtitle ? <p className="text-[var(--color-muted-foreground)] text-sm mt-1">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 shrink-0">
        {children}
        <SiteNavActions />
      </div>
    </header>
  );
}
