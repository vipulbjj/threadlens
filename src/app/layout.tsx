import Link from "next/link";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ThreadLens - Universal Chat Analytics",
  description: "AI-powered insights for WhatsApp, Telegram, and iMessage exports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="px-6 h-16 flex items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-background/80">
          <Link className="flex items-center justify-center transition-transform hover:scale-105" href="/">
            <div className="bg-emerald-500/20 p-1.5 rounded-lg mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ThreadLens<span className="text-emerald-400">.</span></span>
          </Link>
          <nav className="ml-auto flex items-center gap-6">
            <Link className="text-sm font-medium text-muted-foreground hover:text-white transition-colors" href="/upload">
              Upload
            </Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-white transition-colors" href="/dashboard">
              Dashboard
            </Link>
            <Link className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-emerald-400 hover:text-black transition-all shadow-md" href="/upload">
              Start Free
            </Link>
          </nav>
        </header>
        <main className="flex-1 flex flex-col relative">
          {children}
        </main>
      </body>
    </html>
  );
}
