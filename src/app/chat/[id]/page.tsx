"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, MessageSquareText, TrendingUp, Clock, ChevronLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { useChatStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ChatAnalyticsPage() {
  const router = useRouter();
  const { messages: parsedChat, activeChatName } = useChatStore();
  
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: `Hi! I'm ThreadLens AI. Ask me anything about your chat "${activeChatName || 'export'}".` },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!parsedChat || parsedChat.length === 0) {
      router.push("/upload");
    }
  }, [parsedChat, router]);

  const analytics = useMemo(() => {
    if (!parsedChat || parsedChat.length === 0) return null;

    const senders = Array.from(new Set(parsedChat.map((m) => m.sender)));
    const sender1 = senders[0] || "User 1";
    const sender2 = senders[1] || "User 2";

    const msgsSender1 = parsedChat.filter(m => m.sender === sender1).length;
    const msgsSender2 = parsedChat.filter(m => m.sender === sender2).length;

    const hours = parsedChat.map(m => {
      const timeStr = m.time;
      let hour = parseInt(timeStr.split(":")[0]);
      if (timeStr.toLowerCase().includes("pm") && hour !== 12) hour += 12;
      if (timeStr.toLowerCase().includes("am") && hour === 12) hour = 0;
      return hour;
    });

    const mostActiveHour = hours.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    let peakHour = 0;
    let maxMsgs = 0;
    for (const [h, count] of Object.entries(mostActiveHour)) {
      if (count > maxMsgs) {
        maxMsgs = count;
        peakHour = parseInt(h);
      }
    const peakHour12 = peakHour % 12 === 0 ? 12 : peakHour % 12;
    const peakAmPm = peakHour >= 12 ? "PM" : "AM";
    const positiveWords = new Set(["love", "great", "awesome", "good", "happy", "yes", "haha", "lol", "beautiful", "amazing", "thanks", "thank", "perfect", "cool", "sweet", "cute", "fun", "lmao", "yay"]);
    const negativeWords = new Set(["bad", "sad", "hate", "angry", "mad", "no", "sorry", "ugh", "annoying", "terrible", "awful", "stupid", "dumb", "worst", "unfortunately", "cry", "crying", "miss"]);

    const chunkSize = Math.max(1, Math.ceil(parsedChat.length / 3));
    const chunks = [
      parsedChat.slice(0, chunkSize),
      parsedChat.slice(chunkSize, chunkSize * 2),
      parsedChat.slice(chunkSize * 2)
    ];

    const sentimentTrend = chunks.map((chunk, i) => {
      let positive = 0;
      let negative = 0;
      chunk.forEach(m => {
        const words = m.message.toLowerCase().split(/[^a-z]+/);
        words.forEach(w => {
          if (positiveWords.has(w)) positive++;
          if (negativeWords.has(w)) negative++;
        });
      });
      
      // Add a small baseline to prevent 0 rendering flatlines
      return {
        time: i === 0 ? "Start" : i === 1 ? "Mid" : "End",
        positive: positive + 1,
        negative: negative + 1
      };
    });

    return {
      sender1,
      sender2,
      msgsSender1,
      msgsSender2,
      peakTime: `${peakHour12}:00 ${peakAmPm}`,
      sentimentTrend
    };
  }, [parsedChat]);

  const handleAsk = async () => {
    if (!query) return;
    const userMsg = { role: "user", content: query };
    setChatHistory((prev) => [...prev, userMsg]);
    setQuery("");
    setIsTyping(true);

    try {
      // Format chat on frontend to avoid Vercel 4.5MB request payload limits
      const chatContext = parsedChat
        .slice(-10000)
        .map((m: any) => `[${m.date} ${m.time}] ${m.sender}: ${m.message}`)
        .join('\n');

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMsg.content,
          messages: chatHistory.filter(m => m.role !== "system"),
          chatContext: chatContext
        })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        setChatHistory((prev) => [
          ...prev, 
          { 
            role: "assistant", 
            content: data.reply,
            meta: data.usage ? `Tokens: ${data.usage.total_tokens} • Est. Cost: $${data.costEstimate}` : undefined
          }
        ]);
      } else {
        setChatHistory((prev) => [...prev, { role: "assistant", content: `Error: ${data.error || "Unknown error occurred"}` }]);
      }
    } catch (e: any) {
      setChatHistory((prev) => [...prev, { role: "assistant", content: `Error connecting to AI: ${e.message}` }]);
    }

    setIsTyping(false);
  };

  if (!parsedChat || parsedChat.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col items-center p-6 md:p-12">
      
      {/* Header Back Button */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8">
        <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-emerald-400 transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" /> Back to Dashboard
        </Link>
        <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2" /> Live Analysis
        </div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Analytics Center */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
              {activeChatName}
            </h1>
            <p className="text-muted-foreground text-lg">
              {parsedChat.length.toLocaleString()} messages parsed locally.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-secondary/40 backdrop-blur-xl border-border/50 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <MessageSquareText className="h-4 w-4 mr-2" /> Messages Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{analytics?.sender1}</span>
                    <span className="text-xl font-bold text-emerald-400">{analytics?.msgsSender1.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${(analytics!.msgsSender1 / (analytics!.msgsSender1 + analytics!.msgsSender2)) * 100}%` }} />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-medium">{analytics?.sender2}</span>
                    <span className="text-xl font-bold text-blue-400">{analytics?.msgsSender2.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(analytics!.msgsSender2 / (analytics!.msgsSender1 + analytics!.msgsSender2)) * 100}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-secondary/40 backdrop-blur-xl border-border/50 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" /> Most Active Time
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center h-[120px]">
                <p className="text-4xl font-extrabold text-white">{analytics?.peakTime}</p>
                <p className="text-sm text-muted-foreground mt-1">When the real magic happens.</p>
              </CardContent>
            </Card>

            <Card className="col-span-2 bg-secondary/40 backdrop-blur-xl border-border/50 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
                  <TrendingUp className="h-4 w-4 mr-2" /> Sentiment Trend (Local Analysis)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.sentimentTrend || []}>
                    <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="negative" stroke="#f87171" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side: Floating AI Chat */}
        <div className="lg:col-span-5 h-[700px] flex flex-col bg-secondary/20 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          <div className="p-5 border-b border-white/5 bg-secondary/40 flex items-center gap-3 relative z-10">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">ThreadLens AI</h3>
              <p className="text-xs text-muted-foreground">Powered by Grok (128k Context)</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 scroll-smooth">
            {chatHistory.map((msg: any, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-[15px] leading-relaxed shadow-lg whitespace-pre-wrap ${
                    msg.role === "user" 
                      ? "bg-emerald-500 text-white rounded-tr-sm" 
                      : "bg-secondary/80 text-foreground border border-white/5 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.meta && (
                  <span className="text-[11px] font-mono text-muted-foreground mt-2 px-2 bg-secondary/50 py-1 rounded-md">
                    {msg.meta}
                  </span>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl p-4 bg-secondary/80 border border-white/5 text-foreground flex gap-1 items-center h-[52px]">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-secondary/40 relative z-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAsk();
              }}
              className="flex gap-3"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about relationship dynamics, patterns..."
                className="flex-1 bg-background/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-emerald-500/50 rounded-xl h-12 px-4"
              />
              <Button type="submit" size="icon" className="bg-emerald-500 hover:bg-emerald-600 rounded-xl h-12 w-12 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95" disabled={isTyping}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
