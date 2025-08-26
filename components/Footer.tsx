export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="footer" className="mt-16 sm:mt-20 lg:mt-24 border-t border-black/10 dark:border-white/10">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 outline-light">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-md">
            <div className="lux-heading text-2xl font-semibold tracking-wide">Patthar Walay</div>
            <p className="text-sm text-muted">
              Ethically sourced gemstones and handcrafted jewelry. Discover timeless pieces with modern elegance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a aria-label="Instagram" href="https://www.instagram.com/pattharwalay" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 dark:border-white/10 hover:bg-white/5 transition">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m5 5a5 5 0 1 0 0 10a5 5 0 0 0 0-10m6.5-.75a1.25 1.25 0 1 0 0 2.5a1.25 1.25 0 0 0 0-2.5M12 9a3 3 0 1 1 0 6a3 3 0 0 1 0-6"/></svg>
            </a>
            <a aria-label="Facebook" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 dark:border-white/10 hover:bg-white/5 transition">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M12 2a10 10 0 1 0 3.16 19.49V14.9h-2.38v-2.3h2.38v-1.76c0-2.35 1.4-3.65 3.55-3.65c1.03 0 2.1.19 2.1.19v2.3h-1.18c-1.16 0-1.52.72-1.52 1.46v1.46h2.59l-.41 2.3h-2.18v6.58A10 10 0 0 0 12 2"/></svg>
            </a>
            <a aria-label="X" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 dark:border-white/10 hover:bg-white/5 transition">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M3 3h4.1l5.15 7.36L16.3 3H21l-7.4 10.46L21 21h-4.1l-5.28-7.54L7.7 21H3l7.6-10.54z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-black/10 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-xs text-center">
          <p>© {year} Patthar Walay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}



