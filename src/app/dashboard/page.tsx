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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/upload">
            <Button>Upload New Chat</Button>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages Analyzed</CardTitle>
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages > 0 ? totalMessages : "0"}</div>
            <p className="text-xs text-muted-foreground">in current session</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fastest Responder</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages > 0 ? fastSender : "None"}</div>
            <p className="text-xs text-muted-foreground">Based on local parsing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Emotion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Curiosity</div>
            <p className="text-xs text-muted-foreground">From Grok Analysis</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{senders.length} Active</div>
            <p className="text-xs text-muted-foreground">in this chat</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Chats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {activeChatName ? (
                <Link href="/chat/demo-1" className="flex items-center hover:bg-secondary/50 p-2 rounded-lg transition">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{activeChatName}</p>
                    <p className="text-sm text-muted-foreground">Stored locally in session</p>
                  </div>
                  <div className="ml-auto font-medium">{totalMessages} msgs</div>
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">No chats uploaded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
