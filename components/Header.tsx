"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
  <header className={`sticky top-0 z-50 border-b border-black/10 dark:border-white/10 text-foreground transition-all duration-300 bg-background ${scrolled ? "shadow-md" : "shadow-[0_4px_16px_-6px_rgba(0,0,0,0.12)] dark:shadow-none"}`}>
      <nav className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}>
        <a className="sr-only" href="#content">Skip to content</a>
        <a className="sr-only" href="#footer">Skip to footer</a>
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between w-full gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-semibold tracking-wide">Patthar Walay</Link>
            <form action="/products" method="get" className="hidden lg:block">
              <div className="relative">
                <input type="search" name="q" placeholder="Search" className="w-64 rounded-md border border-black/10 dark:border-white/15 bg-background px-9 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent/40" />
                <svg aria-hidden viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground"><path fill="currentColor" d="M21 21l-3.8-3.8m1.3-5.2a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
            </form>
          </div>
          <nav className="flex items-center gap-6 text-sm opacity-90">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/products" className="nav-link">Products</Link>
            <Link href="#about" className="nav-link">About</Link>
            <Link href="#contact" className="nav-link">Contact</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-foreground"><path fill="currentColor" d="M4 7h16v2H4zm0 6h16v2H4z"/></svg>
          </button>
          <Link href="/" className="text-lg font-semibold tracking-wide">Patthar Walay</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {open && (
        <div className="md:hidden px-4 py-3 space-y-3 border-t border-black/10 dark:border-white/10">
          <form action="/products" method="get">
            <input name="q" placeholder="Search" className="w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm text-foreground outline-none" />
          </form>
          <nav className="flex flex-col gap-2 text-foreground opacity-90">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/products" className="nav-link">Products</Link>
            <a href="#about" className="nav-link">About</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
      )}
    </header>
  );
}



