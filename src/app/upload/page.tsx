"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { parseWhatsAppChat } from "@/lib/parser";
import { useChatStore } from "@/lib/store";

export default function UploadPage() {
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
    },
    maxFiles: 1,
  });

  const handleUpload = async (uploadedFile: File) => {
    setIsUploading(true);
    setProgress(20);
    
    try {
      const text = await uploadedFile.text();
      setProgress(50);
      
      const parsedMessages = parseWhatsAppChat(text);
      setProgress(80);
      
      setChat(uploadedFile.name, parsedMessages);
      setProgress(100);
      
      setTimeout(() => {
        router.push("/chat/demo-1");
      }, 500);
    } catch (e) {
      console.error("Failed to parse", e);
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Upload Chat</CardTitle>
          <CardDescription>Drag and drop your exported WhatsApp .txt file here.</CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-emerald-500/50"
              }`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Click or drag file to this area</h3>
              <p className="text-sm text-muted-foreground mt-2">Strictly privacy-first. We do not store your raw files. Everything happens locally in your browser.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 border rounded-lg bg-secondary/30">
                <FileText className="h-8 w-8 text-emerald-500" />
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                {progress === 100 && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              </div>
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Parsing messages locally...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
