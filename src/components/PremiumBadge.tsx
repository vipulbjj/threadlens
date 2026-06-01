import { Crown } from "lucide-react";

/** High-contrast premium pill — explicit light/dark colors (avoids Tailwind `text-warning` collision). */
export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-700/30 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-950 dark:border-amber-400/40 dark:bg-amber-500/20 dark:text-amber-50 sm:text-xs ${className ?? ""}`}
    >
      <Crown className="h-3 w-3 text-amber-800 dark:text-amber-300" aria-hidden />
      Premium
    </span>
  );
}
