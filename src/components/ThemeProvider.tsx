"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

function readThemeFromDom(): Theme {
  if (typeof document === "undefined") return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  if (document.documentElement.classList.contains("dark")) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readThemeFromDom);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const resolved = stored ?? readThemeFromDom();
    setTheme(resolved);
    applyTheme(resolved);
  }, []);

  function toggle() {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      applyTheme(next);
      return next;
    });
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, toggle } = useContext(ThemeCtx);
  const goingLight = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 py-1.5 text-[var(--color-foreground)] shadow-sm hover:bg-[var(--color-accent)] transition-colors touch-manipulation ${showLabel ? "sm:px-3" : "min-w-10"} ${className ?? ""}`}
      aria-label={goingLight ? "Switch to light mode" : "Switch to dark mode"}
      title={goingLight ? "Light mode" : "Dark mode"}
    >
      {goingLight ? <Sun className="h-4 w-4 text-amber-600 dark:text-amber-400" /> : <Moon className="h-4 w-4 text-sky-700 dark:text-sky-300" />}
      {showLabel ? (
        <span className="hidden text-xs font-semibold sm:inline">{goingLight ? "Light" : "Dark"}</span>
      ) : null}
    </button>
  );
}
