"use client";

import { ThemeToggle } from "@/components/ThemeProvider";
import { UserMenu } from "@/components/UserMenu";

/** Theme toggle + account menu — use in every page header. */
export function SiteNavActions({
  className,
  showThemeLabel,
}: {
  className?: string;
  showThemeLabel?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 shrink-0 ${className ?? ""}`}>
      <ThemeToggle showLabel={showThemeLabel} />
      <UserMenu />
    </div>
  );
}
