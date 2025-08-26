export default function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-background outline-light">
        <div className="text-2xl">✓</div>
        <h3 className="mt-2 font-medium">Certified & Ethically Sourced</h3>
        <p className="text-sm text-muted">Each gemstone is inspected and sourced responsibly.</p>
      </div>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-background outline-light">
        <div className="text-2xl">↺</div>
        <h3 className="mt-2 font-medium">30-Day Returns</h3>
        <p className="text-sm text-muted">Shop with confidence with hassle-free returns.</p>
      </div>
      <div className="rounded-xl border border-black/10 dark:border-white/10 p-5 bg-background outline-light">
        <div className="text-2xl">⚡</div>
        <h3 className="mt-2 font-medium">Fast, Secure Delivery</h3>
        <p className="text-sm text-muted">Insured shipping with real-time tracking.</p>
      </div>
    </section>
  );
}



