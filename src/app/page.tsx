import Link from "next/link";
import { ArrowRight, MessageSquare, Shield, Zap, Sparkles, BarChart3, Lock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <section className="w-full min-h-[90vh] flex flex-col items-center justify-center relative overflow-hidden px-6 text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-emerald-300 font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="h-4 w-4" />
          <span>Now supporting WhatsApp, Telegram & iMessage</span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
          Unlock the secrets of your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">conversations.</span>
        </h1>
        
        <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
          Upload any chat export. Ask AI questions. Discover hidden patterns, emotional trends, and relationship dynamics in seconds.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
          <Link href="/upload">
            <button className="h-14 px-8 text-lg font-semibold bg-emerald-500 text-white rounded-full hover:bg-emerald-600 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2">
              Start Analyzing <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="h-14 px-8 text-lg font-semibold bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10 transition-all flex items-center gap-2">
              View Dashboard
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-24 bg-secondary/20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              Why ThreadLens?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">The most advanced, privacy-first relationship analytics engine.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-secondary/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:bg-secondary/60 transition-colors">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Deep Intelligence</h3>
              <p className="text-muted-foreground leading-relaxed">
                Who says sorry more? What's the emotional trend? Our universal parser instantly extracts metadata to build precise analytical charts.
              </p>
            </div>

            <div className="bg-secondary/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:bg-secondary/60 transition-colors">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Ask the Chat Anything</h3>
              <p className="text-muted-foreground leading-relaxed">
                Powered by xAI's Grok. Have a natural conversation with your chat history. Uncover relationship dynamics you never knew existed.
              </p>
            </div>

            <div className="bg-secondary/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:bg-secondary/60 transition-colors relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full" />
              <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="h-7 w-7 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Zero-Knowledge Privacy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your data never hits a database. Parsing happens 100% locally in your browser. We pass your prompt statelessly to the AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-white/5 bg-background text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-emerald-500" />
          <span className="text-xl font-bold tracking-tight text-white">ThreadLens</span>
        </div>
        <p className="text-muted-foreground text-sm">© 2026 ThreadLens Inc. All rights reserved.</p>
        <p className="text-muted-foreground text-sm mt-2">Built with Next.js, Zustand, and xAI Grok.</p>
      </footer>
    </div>
  );
}
