"use client";

import { useEffect } from "react";
import Link from "next/link";
import { SiteNavActions } from "@/components/SiteNavActions";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center px-4 py-8 pb-24 text-center sm:p-6">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <SiteNavActions />
      </div>
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)] max-w-md">
        ThreadLens hit an unexpected error. Your imported chats should still be in local storage on this device.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 min-h-11 touch-manipulation"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-foreground)] min-h-11 inline-flex items-center touch-manipulation"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
