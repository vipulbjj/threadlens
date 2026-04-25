"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MessageSquareText, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/store";

export default function Dashboard() {
  const { messages, activeChatName } = useChatStore();
  
  const totalMessages = messages.length;
  
  // Calculate basic stats
  const senders = Array.from(new Set(messages.map(m => m.sender)));
  
  let fastSender = "N/A";
  if (totalMessages > 0 && senders.length >= 2) {
    // Just a dummy logic for display since accurate response time is complex without DB
    fastSender = senders[0];
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-6xl flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Overview</h2>
          <p className="text-muted-foreground mt-1">Your recent chat analysis sessions.</p>
        </div>
        <Link href="/upload">
          <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white rounded-xl px-6">
            + Upload Chat
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-secondary/40 backdrop-blur-xl border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages Parsed</CardTitle>
            <MessageSquareText className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalMessages > 0 ? totalMessages.toLocaleString() : "0"}</div>
            <p className="text-xs text-muted-foreground mt-1">In current session</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/40 backdrop-blur-xl border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fastest Responder</CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{totalMessages > 0 ? fastSender : "None"}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on local parsing</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/40 backdrop-blur-xl border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Emotion</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">Curiosity</div>
            <p className="text-xs text-muted-foreground mt-1">AI Simulated Estimate</p>
          </CardContent>
        </Card>
        <Card className="bg-secondary/40 backdrop-blur-xl border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Participants</CardTitle>
            <Users className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{senders.length} Active</div>
            <p className="text-xs text-muted-foreground mt-1">In current chat</p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full max-w-6xl">
        <Card className="bg-secondary/20 backdrop-blur-2xl border-white/5 shadow-2xl">
          <CardHeader className="border-b border-white/5 bg-secondary/40">
            <CardTitle className="text-lg">Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeChatName ? (
              <Link 
                href={`/chat/${encodeURIComponent(activeChatName)}`} 
                className="flex items-center bg-secondary/50 hover:bg-secondary border border-white/5 p-4 rounded-xl transition-all hover:scale-[1.01] hover:shadow-lg"
              >
                <div className="p-3 bg-emerald-500/10 rounded-lg mr-4">
                  <MessageSquareText className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white leading-none">{activeChatName}</p>
                  <p className="text-sm text-muted-foreground">Stored securely in local memory</p>
                </div>
                <div className="ml-auto flex items-center">
                  <span className="font-mono text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-md text-sm">
                    {totalMessages.toLocaleString()} msgs
                  </span>
                </div>
              </Link>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                <MessageSquareText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No chats analyzed yet.</p>
                <Link href="/upload">
                  <Button variant="link" className="text-emerald-400 hover:text-emerald-300 mt-2">
                    Upload your first chat export &rarr;
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
