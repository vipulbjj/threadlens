import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThreadLens — Chat insights for couples, friends & teams",
  description:
    "Free private chat analytics from WhatsApp, Telegram, or iMessage exports. Conflict patterns, balance, guided prompts. Parsing stays on your device.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "512x512" },
  },
  openGraph: {
    title: "ThreadLens — Understand your chats before the hard talk",
    description: "Import a chat export. See patterns locally. Optional AI with guided prompts for couples and more.",
    url: "https://threadlens.vercel.app",
    siteName: "ThreadLens",
    images: [{ url: "/apple-touch-icon.png", width: 512, height: 512, alt: "ThreadLens" }],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');var d=t||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.classList.add(d);if(d==='light')document.documentElement.classList.remove('dark');})()`,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-[var(--color-border)] bg-[var(--color-background)]/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden pointer-events-none">
            <div className="pointer-events-auto flex w-full max-w-lg justify-around px-2 py-2">
              <Link href="/" className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                Home
              </Link>
              <Link href="/upload" className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                Import
              </Link>
              <Link href="/dashboard" className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
                Threads
              </Link>
            </div>
          </nav>
        </ThemeProvider>
      </body>
    </html>
  );
}
