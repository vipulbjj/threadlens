"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const mockSentimentData = [
  { time: "Jan", positive: 40, negative: 10 },
  { time: "Feb", positive: 30, negative: 20 },
  { time: "Mar", positive: 60, negative: 5 },
  { time: "Apr", positive: 45, negative: 15 },
  { time: "May", positive: 70, negative: 0 },
];

export default function ChatAnalyticsPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm ThreadLens AI. Ask me anything about this conversation." },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAsk = () => {
    if (!query) return;
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setQuery("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Based on the chat history, Vipul apologized 12 times compared to Rahul's 4. The emotional trend shows a peak in 'Joy' during March.",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Panel: Analytics */}
      <div className="flex-1 overflow-y-auto p-8 border-r border-border/40">
        <h2 className="text-3xl font-bold mb-6">Conversation Analytics</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sorry Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">Vipul</p>
                  <p className="text-3xl font-bold text-emerald-400">12</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rahul</p>
                  <p className="text-3xl font-bold text-blue-400">4</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Most Active Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">10:00 PM</p>
              <p className="text-sm text-muted-foreground">Late night thinkers</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Sentiment Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockSentimentData}>
                  <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="positive" stroke="#34d399" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="negative" stroke="#f87171" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel: AI Q&A */}
      <div className="w-[450px] flex flex-col bg-secondary/10">
        <div className="p-4 border-b border-border/40 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold">ThreadLens AI</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === "user" ? "bg-emerald-500 text-white" : "bg-secondary text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl p-3 bg-secondary text-foreground text-sm flex gap-1">
                <span className="animate-bounce">.</span><span className="animate-bounce delay-100">.</span><span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex gap-2"
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about this chat..."
              className="flex-1 bg-background"
            />
            <Button type="submit" size="icon" className="bg-emerald-500 hover:bg-emerald-600">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
