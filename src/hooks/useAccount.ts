"use client";

import { useCallback, useEffect, useState } from "react";
import type { UsageSnapshot } from "@/lib/usage";
import { writeCachedTier } from "@/lib/tiers";

export interface MeResponse {
  authenticated: boolean;
  authEnabled: boolean;
  email?: string;
  isPremium: boolean;
  usage: UsageSnapshot;
}

export function useAccount() {
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const json = (await res.json()) as MeResponse;
      setData(json);
      writeCachedTier(json.isPremium ? "premium" : "free");
    } catch {
      setData({
        authenticated: false,
        authEnabled: false,
        isPremium: false,
        usage: { tier: "free", aiQuestionsToday: 0, aiLimit: 12, canAskAi: true, isPremium: false },
      });
      writeCachedTier("free");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { account: data, loading, refresh };
}
