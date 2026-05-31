import Link from "next/link";

const CONTACT = {
  site: "https://vipulbajaj.com",
  linkedin: "https://www.linkedin.com/in/vipulbajaj/",
  x: "https://x.com/vipulbajaj",
};

export function SiteFooter({ className = "" }: { className?: string }) {
  return (
    <footer className={`border-t border-[var(--color-border)] py-10 px-6 text-center text-sm text-[var(--color-muted-foreground)] ${className}`}>
      <p className="text-[var(--color-foreground)]">
        ThreadLens is free — built for reflection, not therapy or legal advice.
      </p>
      <p className="mt-3">
        Built by{" "}
        <a href={CONTACT.site} className="text-emerald-400 hover:underline" target="_blank" rel="noopener noreferrer">
          Vipul Bajaj
        </a>
        {" · "}
        <a href={CONTACT.linkedin} className="hover:text-[var(--color-foreground)]" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        {" · "}
        <a href={CONTACT.x} className="hover:text-[var(--color-foreground)]" target="_blank" rel="noopener noreferrer">
          X
        </a>
      </p>
      <p className="mt-4 text-xs text-[var(--color-muted-foreground)]">
        Feedback or collabs? Say hi via{" "}
        <a href={CONTACT.site} className="text-[var(--color-muted-foreground)] hover:text-emerald-400/90">
          vipulbajaj.com
        </a>
        . Parsing stays in your browser; AI is optional.
      </p>
      <nav className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
        <Link href="/pricing" className="hover:text-[var(--color-foreground)]">
          Pricing
        </Link>
        <Link href="/use-cases" className="hover:text-[var(--color-foreground)]">
          Use cases
        </Link>
        <Link href="/upload" className="hover:text-[var(--color-foreground)]">
          Import
        </Link>
        <Link href="/dashboard" className="hover:text-[var(--color-foreground)]">
          Threads
        </Link>
      </nav>
    </footer>
  );
}

export { CONTACT };
