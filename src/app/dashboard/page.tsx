import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MessageSquareText, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
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
            <div className="text-2xl font-bold">14,231</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 mins</div>
            <p className="text-xs text-muted-foreground">Vipul is 2x faster</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Emotion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Joy</div>
            <p className="text-xs text-muted-foreground">Followed by curiosity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3 Active</div>
            <p className="text-xs text-muted-foreground">Since joining ThreadLens</p>
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
              <Link href="/chat/demo-1" className="flex items-center hover:bg-secondary/50 p-2 rounded-lg transition">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Vipul & Rahul</p>
                  <p className="text-sm text-muted-foreground">Last message: 2 hours ago</p>
                </div>
                <div className="ml-auto font-medium">1,200 msgs</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
