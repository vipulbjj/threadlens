"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, CheckCircle2, MessageCircle, Send, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { parseUniversalChat } from "@/lib/parser";
import { useChatStore } from "@/lib/store";

type Platform = "whatsapp" | "telegram" | "imessage";

export default function UploadPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("whatsapp");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const setChat = useChatStore((state) => state.setChat);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/json": [".json"]
    },
    maxFiles: 1,
  });

  const handleUpload = async (uploadedFile: File) => {
    setIsUploading(true);
    setProgress(20);
    
    try {
      const text = await uploadedFile.text();
      setProgress(50);
      
      const parsedMessages = parseUniversalChat(text);
      setProgress(80);
      
      setChat(uploadedFile.name, parsedMessages);
      setProgress(100);
      
      setTimeout(() => {
        router.push(`/chat/${encodeURIComponent(uploadedFile.name)}`);
      }, 500);
    } catch (e) {
      console.error("Failed to parse", e);
      setIsUploading(false);
    }
  };

  const platforms = [
    { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/50" },
    { id: "telegram", name: "Telegram", icon: Send, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/50" },
    { id: "imessage", name: "iMessage", icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/50" },
  ];

  const getInstructions = (platform: Platform) => {
    switch (platform) {
      case "whatsapp": return "Open chat > Contact Info > Export Chat > Without Media > Upload .txt file here.";
      case "telegram": return "Telegram Desktop > Settings > Advanced > Export Telegram Data > Uncheck media, select JSON/TXT.";
      case "imessage": return "Use a Mac app like iMazing to export the thread to TXT, then drop it below.";
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen">
      
      {/* Platform Selector */}
      <div className="w-full max-w-2xl mb-8 flex gap-4 justify-center">
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlatform(p.id as Platform)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all border ${selectedPlatform === p.id ? p.bg + " shadow-lg" : "border-white/5 bg-secondary hover:bg-secondary/80 text-muted-foreground"}`}
          >
            <p.icon className={`h-5 w-5 ${selectedPlatform === p.id ? p.color : ""}`} />
            <span className={`font-semibold ${selectedPlatform === p.id ? "text-white" : ""}`}>{p.name}</span>
          </button>
        ))}
      </div>

      <Card className="w-full max-w-2xl bg-secondary/30 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Upload {platforms.find(p => p.id === selectedPlatform)?.name} Chat</CardTitle>
          <CardDescription className="text-md mt-2">
            {getInstructions(selectedPlatform)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]" : "border-white/10 hover:border-emerald-500/50 hover:bg-white/5"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className={`mx-auto h-16 w-16 mb-6 transition-colors ${isDragActive ? "text-emerald-400" : "text-muted-foreground"}`} />
              <h3 className="text-xl font-bold text-white mb-2">Drop your export file here</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Strictly privacy-first. We do not store your raw files. Parsing happens instantly in your browser.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-5 border border-white/10 rounded-xl bg-secondary/50">
                <FileText className="h-10 w-10 text-emerald-400" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                {progress === 100 && <CheckCircle2 className="h-8 w-8 text-emerald-400" />}
              </div>
              {isUploading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-emerald-400 animate-pulse">Running Universal Parser...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-secondary" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
