import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ByokProvider = "openai" | "anthropic" | "groq" | "xai";

export interface ByokConfig {
  provider: ByokProvider;
  apiKey: string;
  model?: string;
}

interface ByokStore {
  config: ByokConfig | null;
  set: (config: ByokConfig | null) => void;
}

export const BYOK_PROVIDER_OPTIONS: { id: ByokProvider; label: string; defaultModel: string; baseURL: string }[] = [
  { id: "openai",    label: "OpenAI",    defaultModel: "gpt-4o-mini",          baseURL: "https://api.openai.com/v1" },
  { id: "groq",     label: "Groq",      defaultModel: "llama-3.3-70b-versatile", baseURL: "https://api.groq.com/openai/v1" },
  { id: "xai",      label: "xAI",       defaultModel: "grok-beta",             baseURL: "https://api.x.ai/v1" },
  { id: "anthropic",label: "Anthropic", defaultModel: "claude-haiku-3-5",      baseURL: "" }, // handled specially
];

export const useByokStore = create<ByokStore>()(
  persist(
    (set) => ({
      config: null,
      set: (config) => set({ config }),
    }),
    {
      name: "threadlens-byok",
      storage: createJSONStorage(() => ({
        getItem: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
        setItem: (key, value) => { try { localStorage.setItem(key, value); } catch {} },
        removeItem: (key) => { try { localStorage.removeItem(key); } catch {} },
      })),
    }
  )
);
