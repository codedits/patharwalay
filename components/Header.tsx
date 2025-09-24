"use client";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement | null>(null);

  const closeProducts = useCallback(() => setProductsOpen(false), []);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // control mount/visibility for off-canvas menu so we can animate in/out
  useEffect(() => {
    let timeout: number | undefined;
    if (open) {
      setMenuMounted(true);
      // next tick allow transition to run
      timeout = window.setTimeout(() => setMenuVisible(true), 20);
    } else {
      setMenuVisible(false);
      // wait for exit transition before unmounting
      timeout = window.setTimeout(() => setMenuMounted(false), 300);
    }
    return () => { if (timeout) clearTimeout(timeout); };
  }, [open]);

  // lock body scroll while menu open
  useEffect(() => {
    if (menuMounted) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
    return;
  }, [menuMounted]);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!productsRef.current) return;
      if (productsRef.current.contains(e.target as Node)) return;
      setProductsOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProductsOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
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
            <div className="relative" ref={productsRef}>
              <button
                aria-haspopup="true"
                aria-expanded={productsOpen}
                onClick={() => setProductsOpen((v) => !v)}
                onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setProductsOpen(true); } }}
                className="nav-link"
              >
                Products ▾
              </button>
              <div className={`absolute left-0 mt-2 w-44 rounded-md border bg-background shadow-lg ${productsOpen ? 'block' : 'hidden'}`}>
                <div className="py-1">
                  <Link href="/gemstones" className="block px-4 py-2 text-sm hover:bg-black/5">Gemstones</Link>
                  <Link href="/rings" className="block px-4 py-2 text-sm hover:bg-black/5">Rings</Link>
                  <Link href="/bracelets" className="block px-4 py-2 text-sm hover:bg-black/5">Bracelets</Link>
                </div>
              </div>
            </div>
            <Link href="#about" className="nav-link">About</Link>
            <Link href="#contact" className="nav-link">Contact</Link>
            <Link href="/admin" className="nav-link">Admin</Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center justify-between w-full">
          <button aria-label="Menu" onClick={() => { setOpen((v) => !v); setSearchOpen(false); }} className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition">
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 text-foreground"><path fill="currentColor" d="M4 7h16v2H4zm0 6h16v2H4z"/></svg>
          </button>
          <Link href="/" className="text-lg font-semibold tracking-wide">Patthar Walay</Link>
          <div className="flex items-center gap-2">
            <button aria-label="Search" onClick={() => { setSearchOpen((s) => !s); setOpen(false); }} className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>
      {/* Mobile off-canvas menu */}
      {menuMounted && (
        <div className="md:hidden relative z-40">
          {/* Backdrop */}
          <div
            aria-hidden
            onClick={() => setOpen(false)}
            className={`fixed inset-0 bg-black/40 transition-opacity ${menuVisible ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Sliding panel (from left) */}
          <aside className={`fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-background border-r border-black/10 dark:border-white/10 shadow-xl transform transition-transform duration-300 ${menuVisible ? 'translate-x-0' : '-translate-x-full'}`} role="dialog" aria-modal="true">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
              <div className="text-lg font-semibold">Menu</div>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div className="px-4 py-4 space-y-4">
              <nav className="flex flex-col gap-3 text-foreground opacity-95">
                <Link href="/" className="nav-link" onClick={() => setOpen(false)}>Home</Link>

                {/* Mobile expandable Products */}
                <div>
                  <button className="w-full flex items-center justify-between text-left nav-link" onClick={() => setMobileProductsOpen((v) => !v)}>
                    <span>Products</span>
                    <span className="text-sm">{mobileProductsOpen ? '−' : '+'}</span>
                  </button>
                  <div className={`pl-3 mt-2 ${mobileProductsOpen ? 'block' : 'hidden'}`}>
                    <nav className="flex flex-col gap-2">
                      <Link href="/gemstones" className="nav-link" onClick={() => setOpen(false)}>Gemstones</Link>
                      <Link href="/rings" className="nav-link" onClick={() => setOpen(false)}>Rings</Link>
                      <Link href="/bracelets" className="nav-link" onClick={() => setOpen(false)}>Bracelets</Link>
                    </nav>
                  </div>
                </div>

                {/* About expandable */}
                <div>
                  <button className="w-full flex items-center justify-between text-left nav-link" onClick={() => setMobileAboutOpen((v) => !v)}>
                    <span>About</span>
                    <span className="text-sm">{mobileAboutOpen ? '−' : '+'}</span>
                  </button>
                  <div className={`pl-3 mt-2 text-sm text-muted ${mobileAboutOpen ? 'block' : 'hidden'}`}>
                    <p className="mb-2">Patthar Walay curates ethically sourced gemstones and handcrafted jewelry. We work directly with miners and artisans to ensure fair practices and high-quality gems.</p>
                    <p className="mb-2">Each piece is inspected and finished by hand. We focus on timeless designs and transparent sourcing — learn more on our About page.</p>
                    <p className="text-xs text-muted">Shipping worldwide • 30-day returns • Certificate of authenticity on selected items</p>
                  </div>
                </div>

                {/* Contact expandable */}
                <div>
                  <button className="w-full flex items-center justify-between text-left nav-link" onClick={() => setMobileContactOpen((v) => !v)}>
                    <span>Contact</span>
                    <span className="text-sm">{mobileContactOpen ? '−' : '+'}</span>
                  </button>
                  <div className={`pl-3 mt-2 text-sm text-muted ${mobileContactOpen ? 'block' : 'hidden'}`}>
                    <p className="mb-1">Customer service hours: Mon–Sat, 9am–6pm (PKT)</p>
                    <p className="mb-1">Phone: <a className="underline" href="tel:+923001234567">+92 300 1234567</a></p>
                    <p className="mb-1">Email: <a className="underline" href="mailto:hello@pattharwalay.example">hello@pattharwalay.example</a></p>
                    <p className="text-xs text-muted">Follow us on Instagram for new arrivals and behind-the-scenes updates.</p>
                  </div>
                </div>

                <Link href="/admin" className="nav-link" onClick={() => setOpen(false)}>Admin</Link>
              </nav>
            </div>
          </aside>
        </div>
      )}

      {searchOpen && (
        <div className="md:hidden px-4 py-3 border-t border-black/10 dark:border-white/10">
          <form action="/products" method="get">
            <div className="relative">
              <input autoFocus name="q" placeholder="Search" className="w-full rounded-md border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm text-foreground outline-none" />
              <button type="button" aria-label="Close search" onClick={() => setSearchOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}



