"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Smartphone, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { capImportedMessages, parseUniversalChat, ParseError } from "@/lib/parser";
import { isAcceptedUploadFile, readChatExportFile } from "@/lib/read-upload-file";
import { useChatStore, type ChatPlatform } from "@/lib/store";
import { USE_CASES, type UseCaseId } from "@/lib/use-cases";
import { useAccount } from "@/hooks/useAccount";
import { tierFromPremium, getLimits } from "@/lib/tiers";
import { PremiumUpsell } from "@/components/PremiumUpsell";
import { SiteNavActions } from "@/components/SiteNavActions";
import { ExportGuide } from "@/components/ExportGuide";

const PLATFORMS: { id: ChatPlatform; label: string; hint: string }[] = [
  { id: "whatsapp", label: "WhatsApp", hint: ".txt or .zip from Export chat" },
  { id: "telegram", label: "Telegram", hint: ".txt or .json export" },
  { id: "imessage", label: "iMessage", hint: ".txt thread export" },
];

export default function UploadPage() {
  const router = useRouter();
  const { account } = useAccount();
  const tier = tierFromPremium(Boolean(account?.isPremium));
  const limits = getLimits(tier);
  const setChat = useChatStore((s) => s.setChat);
  const [platform, setPlatform] = useState<ChatPlatform>("whatsapp");
  const [useCase, setUseCase] = useState<UseCaseId>("couples");
  const [error, setError] = useState<string | null>();
  const [notice, setNotice] = useState<string | null>();
  const [loading, setLoading] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setNotice(null);
      setLoading(true);
      try {
        const { text, displayName } = await readChatExportFile(file, limits.maxUploadBytes);
        const parsed = parseUniversalChat(text, platform);
        if (parsed.length === 0) {
          throw new ParseError("No messages found in that file.");
        }
        const { messages, truncated, originalCount } = capImportedMessages(parsed, tier);
        if (truncated) {
          setNotice(
            account?.isPremium
              ? `Loaded the most recent ${messages.length.toLocaleString()} of ${originalCount.toLocaleString()} messages (browser safety cap).`
              : `Loaded the most recent ${messages.length.toLocaleString()} of ${originalCount.toLocaleString()} messages. Free tier keeps 35k — Premium imports the full thread.`
          );
        } else if (originalCount > 50_000) {
          setNotice(
            `Parsed ${originalCount.toLocaleString()} messages in your browser. Very large threads may feel slow on older devices.`
          );
        }
        const sessionId = setChat(displayName, messages, platform, useCase);
        router.push(`/chat/${encodeURIComponent(sessionId)}`);
      } catch (err) {
        const message = err instanceof ParseError ? err.message : "Could not read that file. Try another export.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [platform, useCase, router, setChat, tier, account?.isPremium]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) void handleUpload(file);
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/json": [".json"],
      "application/zip": [".zip"],
      "application/x-zip-compressed": [".zip"],
    },
    validator: (file) => (isAcceptedUploadFile(file) ? null : { code: "file-invalid-type", message: "Use .txt, .json, or .zip" }),
    maxFiles: 1,
    maxSize: limits.maxUploadBytes,
    onDropRejected: (rejections) => {
      const tooLarge = rejections.some((r) => r.errors.some((e) => e.code === "file-too-large"));
      const badType = rejections.some((r) => r.errors.some((e) => e.code === "file-invalid-type"));
      if (tooLarge) {
        setError(
          `File is too large for the ${tier} tier (max ${Math.round(limits.maxUploadBytes / (1024 * 1024))} MB). Premium supports much larger exports if your device can handle them.`
        );
      } else if (badType) {
        setError("Upload a .txt, .json, or .zip export (phone downloads are often a ZIP).");
      } else {
        setError("Could not accept that file. Try a chat export in .txt, .json, or .zip format.");
      }
    },
    disabled: loading,
  });

  const selectedUseCase = USE_CASES.find((u) => u.id === useCase);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] flex flex-col items-center justify-center px-4 py-6 pb-24 sm:p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            ← Home
          </Link>
          <SiteNavActions />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Drop your chat export</h1>
          <p className="text-[var(--color-muted-foreground)] text-sm">
            Parsing stays on your device. Optional AI uses a free-tier model when configured on the server.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide mb-2">What are you analyzing?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {USE_CASES.map((uc) => (
              <button
                key={uc.id}
                type="button"
                onClick={() => setUseCase(uc.id)}
                className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                  useCase === uc.id
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-100"
                    : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:border-[var(--color-ring)]"
                }`}
              >
                <span className="mr-1">{uc.emoji}</span>
                {uc.label}
              </button>
            ))}
          </div>
          {selectedUseCase && (
            <p className="mt-2 text-xs text-[var(--color-muted-foreground)] leading-relaxed">{selectedUseCase.tagline}</p>
          )}
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`min-h-11 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                platform === p.id
                  ? "bg-emerald-500 text-zinc-950"
                  : "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:bg-[var(--color-accent)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-[var(--color-muted-foreground)]">{PLATFORMS.find((p) => p.id === platform)?.hint}</p>

        <div
          {...getRootProps()}
          className={`min-h-[11rem] border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
            isDragActive ? "border-emerald-400 bg-emerald-500/10" : "border-[var(--color-border)] hover:border-[var(--color-ring)]"
          } ${loading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 tl-accent mb-4" />
          <p className="text-lg font-medium">{loading ? "Reading your file…" : "Drag & drop a .txt, .json, or .zip"}</p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">iPhone often saves exports as a ZIP — that works too</p>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
            Max {Math.round(limits.maxUploadBytes / (1024 * 1024))} MB · large files are parsed, then trimmed if needed
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)]/70 mt-3">
            Try the{" "}
            <button
              type="button"
              className="text-emerald-500/90 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                void fetch("/fixtures/sample-whatsapp.txt")
                  .then((r) => r.blob())
                  .then((blob) => {
                    const f = new File([blob], "sample-whatsapp.txt", { type: "text/plain" });
                    void handleUpload(f);
                  });
              }}
            >
              sample chat
            </button>
          </p>
        </div>

        {notice && (
          <div className="rounded-xl border tl-warn-border tl-warn-bg p-4 text-sm tl-warn-fg">
            {notice}
          </div>
        )}

        {notice?.includes("Free tier") && !account?.isPremium && (
          <PremiumUpsell reason="import" email={account?.email} />
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-900 dark:text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {platform === "whatsapp" && <ExportGuide />}

        {platform !== "whatsapp" && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-sm text-[var(--color-muted-foreground)] space-y-1.5">
            <p className="font-medium text-[var(--color-foreground)] flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> How to export
            </p>
            {platform === "telegram" && (
              <p className="text-[var(--color-muted-foreground)]">Desktop app → select chat → ⋮ → Export chat history → choose .txt or .json</p>
            )}
            {platform === "imessage" && (
              <p className="text-[var(--color-muted-foreground)]">Copy the thread to Notes, or use a Mac export tool to save as .txt</p>
            )}
          </div>
        )}

        <Link href="/use-cases" className="block text-center text-emerald-700 dark:text-emerald-400/80 text-sm hover:underline sm:text-xs">
          See all use cases →
        </Link>
      </div>
    </div>
  );
}
