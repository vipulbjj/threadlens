"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, MessageSquare, Smartphone, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { capImportedMessages, parseUniversalChat, ParseError } from "@/lib/parser";
import { useChatStore, type ChatPlatform } from "@/lib/store";

const PLATFORMS: { id: ChatPlatform; label: string; hint: string }[] = [
  { id: "whatsapp", label: "WhatsApp", hint: ".txt from Export chat" },
  { id: "telegram", label: "Telegram", hint: ".txt or .json export" },
  { id: "imessage", label: "iMessage", hint: ".txt thread export" },
];

export default function UploadPage() {
  const router = useRouter();
  const setChat = useChatStore((s) => s.setChat);
  const [platform, setPlatform] = useState<ChatPlatform>("whatsapp");
  const [error, setError] = useState<string | null>();
  const [notice, setNotice] = useState<string | null>();
  const [loading, setLoading] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setNotice(null);
      setLoading(true);
      try {
        const text = await file.text();
        const parsed = parseUniversalChat(text, platform);
        if (parsed.length === 0) {
          throw new ParseError("No messages found in that file.");
        }
        const { messages, truncated, originalCount } = capImportedMessages(parsed);
        if (truncated) {
          setNotice(
            `Loaded the most recent ${messages.length.toLocaleString()} of ${originalCount.toLocaleString()} messages so your browser stays fast.`
          );
        }
        const name = file.name.replace(/\.[^.]+$/, "") || "Imported chat";
        const sessionId = setChat(name, messages, platform);
        router.push(`/chat/${encodeURIComponent(sessionId)}`);
      } catch (err) {
        const message = err instanceof ParseError ? err.message : "Could not read that file. Try another export.";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [platform, router, setChat]
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
    accept: { "text/plain": [".txt"], "application/json": [".json"] },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Drop your chat export</h1>
          <p className="text-zinc-400 text-sm">
            Parsing stays on your device. AI chat sends only the messages you choose to ask about.
          </p>
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
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-zinc-500">{PLATFORMS.find((p) => p.id === platform)?.hint}</p>

        <div
          {...getRootProps()}
          className={`min-h-[11rem] border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center ${
            isDragActive ? "border-emerald-400 bg-emerald-500/10" : "border-zinc-700 hover:border-zinc-500"
          } ${loading ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
          <p className="text-lg font-medium">{loading ? "Reading your file…" : "Drag & drop a .txt or .json file"}</p>
          <p className="text-sm text-zinc-500 mt-2">or click to browse</p>
          <p className="text-xs text-zinc-600 mt-3">
            Try the{" "}
            <button
              type="button"
              className="text-emerald-500/90 hover:underline"
              onClick={() => {
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
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            {notice}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400 space-y-2">
          <p className="font-medium text-zinc-200 flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> How to export
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-500">
            <li>WhatsApp: Chat → ⋮ → Export chat → Without media → .txt</li>
            <li>Telegram: Desktop app → Export chat history (.txt or .json)</li>
            <li>iMessage: Copy thread to Notes or use a Mac export tool → .txt</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
