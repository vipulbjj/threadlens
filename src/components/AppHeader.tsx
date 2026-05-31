import Link from "next/link";
import type { ReactNode } from "react";
import { UserMenu } from "@/components/UserMenu";

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  backHref?: string;
  children?: ReactNode;
}

export function AppHeader({ title, subtitle, backHref, children }: AppHeaderProps) {
  return (
    <header className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {backHref ? (
          <Link href={backHref} className="text-sm text-zinc-500 hover:text-zinc-300 shrink-0 mt-1">
            ←
          </Link>
        ) : null}
        <div className="min-w-0">
          {title ? <h1 className="text-2xl font-bold tracking-tight">{title}</h1> : null}
          {subtitle ? <p className="text-zinc-400 text-sm mt-1">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {children}
        <UserMenu />
      </div>
    </header>
  );
}
