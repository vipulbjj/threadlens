import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNavActions } from "@/components/SiteNavActions";

export function AuthPageShell({
  backHref,
  backLabel,
  children,
}: {
  backHref: string;
  backLabel: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center px-4 py-8 pb-24 sm:p-6">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <SiteNavActions />
      </div>
      <Link
        href={backHref}
        className="mb-8 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] self-start max-w-md w-full"
      >
        ← {backLabel}
      </Link>
      {children}
    </div>
  );
}
