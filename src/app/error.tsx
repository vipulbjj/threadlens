"use client";

import { useEffect } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-400 max-w-md">
        ThreadLens hit an unexpected error. Your imported chats should still be in local storage on this device.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
          Home
        </Link>
      </div>
    </div>
  );
}
