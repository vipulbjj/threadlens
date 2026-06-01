"use client";

import Link from "next/link";
import { useChatStore } from "@/lib/store";

export function HomeSessionsLink() {
  const count = useChatStore((s) => s.sessions.length);
  if (count === 0) return null;
  return (
    <Link href="/dashboard" className="text-sm tl-accent hover:underline">
      View {count} saved thread{count === 1 ? "" : "s"}
    </Link>
  );
}
