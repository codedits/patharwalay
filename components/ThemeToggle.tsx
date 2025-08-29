"use client";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const el = document.documentElement;
  if (theme === "dark") {
    el.classList.add("dark");
    el.classList.remove("light");
  } else {
    el.classList.remove("dark");
    el.classList.add("light");
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
  const stored = (localStorage.getItem("theme") as Theme | null);
  const initial: Theme = stored ?? 'dark';
      setTheme(initial);
      applyTheme(initial);
    } catch {
      // noop
    }
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore
    }
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 dark:border-white/15 bg-white/50 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition"
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? (
        // Sun icon
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-foreground"><path fill="currentColor" d="M12 4a1 1 0 011 1v1a1 1 0 11-2 0V5a1 1 0 011-1zm0 13a5 5 0 100-10 5 5 0 000 10zm8-5a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1zM4 12a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zm13.657 6.657a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4.222 5.636A1 1 0 115.636 4.222l.707.707A1 1 0 115.636 6.343l-.707-.707zm12.728-1.414a1 1 0 111.414 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707zM5.636 18.364a1 1 0 10-1.414-1.414l-.707.707a1 1 0 101.414 1.414l.707-.707z"/></svg>
      ) : (
        // Moon icon
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-foreground"><path fill="currentColor" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
      )}
    </button>
  );
}
