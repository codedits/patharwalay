export default function Newsletter() {
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 p-6 md:p-8 bg-background">
      <div className="md:flex items-center justify-between gap-6">
        <div>
          <h3 className="lux-heading text-xl font-semibold tracking-tight">Join our newsletter</h3>
          <p className="text-sm text-muted">Get new arrivals, style tips and special offers.</p>
        </div>
        <form className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input type="email" placeholder="you@example.com" className="w-full md:w-80 rounded-md border border-black/10 dark:border-white/10 bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
          <button className="btn-primary w-full sm:w-auto">Subscribe</button>
        </form>
      </div>
    </section>
  );
}




