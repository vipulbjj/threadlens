"use client";

import { useState } from "react";
import { Key, X, ChevronDown, Check, Eye, EyeOff } from "lucide-react";
import { useByokStore, BYOK_PROVIDER_OPTIONS, type ByokProvider } from "@/lib/byok-store";

export function ByokDialog({ onClose }: { onClose: () => void }) {
  const { config, set } = useByokStore();
  const [provider, setProvider] = useState<ByokProvider>(config?.provider ?? "groq");
  const [apiKey, setApiKey] = useState(config?.apiKey ?? "");
  const [model, setModel] = useState(config?.model ?? "");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedProvider = BYOK_PROVIDER_OPTIONS.find((p) => p.id === provider)!;

  function handleSave() {
    if (!apiKey.trim()) return;
    set({
      provider,
      apiKey: apiKey.trim(),
      model: model.trim() || selectedProvider.defaultModel,
    });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  }

  function handleClear() {
    set(null);
    setApiKey("");
    setModel("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-card)] border border-[var(--color-border)] shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-semibold text-base text-[var(--color-foreground)] flex items-center gap-2">
              <Key className="h-4 w-4 text-emerald-500" /> Use your own API key
            </h2>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Your key is stored only in your browser. Never sent to our servers.
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] p-1 -mr-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Provider selector */}
        <div>
          <label className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1.5 block">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {BYOK_PROVIDER_OPTIONS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setProvider(p.id); setModel(""); }}
                className={`rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                  provider === p.id
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium"
                    : "border-[var(--color-border)] text-[var(--color-foreground)]/80 hover:border-emerald-500/40"
                }`}
              >
                {p.label}
                {provider === p.id && <Check className="h-3 w-3 inline ml-1.5 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1.5 block">API Key</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`sk-...`}
              className="w-full rounded-xl bg-[var(--color-input)] border border-[var(--color-border)] px-4 py-3 pr-10 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Optional model override */}
        <div>
          <label className="text-xs font-medium text-[var(--color-muted-foreground)] mb-1.5 block">
            Model <span className="font-normal opacity-60">(optional — defaults to {selectedProvider.defaultModel})</span>
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={selectedProvider.defaultModel}
            className="w-full rounded-xl bg-[var(--color-input)] border border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>

        <div className="flex gap-2 pt-1">
          {config && (
            <button
              onClick={handleClear}
              className="flex-1 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300 font-medium hover:bg-red-500/20 transition-colors"
            >
              Remove key
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!apiKey.trim()}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-40 transition-colors"
          >
            {saved ? "Saved ✓" : "Save key"}
          </button>
        </div>

        <p className="text-[10px] text-[var(--color-muted-foreground)]/60 text-center leading-snug">
          Key is stored in your browser only · Clears when you clear site data · Usage billed directly to your account on the provider
        </p>
      </div>
    </div>
  );
}

export function ByokBadge({ onClick }: { onClick: () => void }) {
  const config = useByokStore((s) => s.config);
  if (!config) return null;
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors"
    >
      <Key className="h-3 w-3" />
      {BYOK_PROVIDER_OPTIONS.find((p) => p.id === config.provider)?.label}
      <ChevronDown className="h-3 w-3 opacity-60" />
    </button>
  );
}
