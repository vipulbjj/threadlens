import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 lg:px-8 h-16 flex items-center border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <Zap className="h-6 w-6 text-emerald-500" />
          <span className="ml-2 text-lg font-semibold tracking-tight">ThreadLens</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-emerald-400 transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-emerald-400 transition-colors" href="/dashboard">
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent -z-10" />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Understand what your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">conversations actually say.</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl font-medium">
                  Upload WhatsApp chats. Ask AI questions. Discover patterns hidden in communication. ThreadLens brings emotional intelligence to your chat exports.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/upload">
                  <Button className="h-12 px-8 bg-emerald-500 text-white hover:bg-emerald-600">
                    Upload Chat <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="h-12 px-8">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-5xl grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary rounded-full">
                  <MessageSquare className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Deep Analytics</h3>
                <p className="text-muted-foreground">Who says sorry more? What's the emotional trend? We parse it all.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary rounded-full">
                  <Zap className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">AI Questions</h3>
                <p className="text-muted-foreground">Chat with your conversations. Ask natural language questions about relationship dynamics.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary rounded-full">
                  <Shield className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold">Privacy First</h3>
                <p className="text-muted-foreground">Your chats are processed securely. We don't train models on your private conversations.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2026 ThreadLens Inc. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
