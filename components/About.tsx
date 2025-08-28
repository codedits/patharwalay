export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2 items-start">
        <div className="rounded-xl p-5 sm:p-6 bg-background outline-light">
          <h2 id="about-heading" className="lux-heading text-xl sm:text-2xl font-semibold tracking-tight mb-2 heading-underline">About us</h2>
          <p className="text-sm sm:text-base text-muted">
            We craft timeless jewelry with responsibly sourced gemstones and thoughtful design. Each piece is
            inspected by experts and finished by skilled artisans in Pakistan. Our goal is simple: create
            heirloom-quality pieces you can wear every day.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-5">
          <div className="rounded-xl p-5 bg-background outline-light">
            <div className="text-sm sm:text-base text-foreground font-medium">What guides us</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              <li>• Certified stones and transparent sourcing</li>
              <li>• Hand-finished settings with lasting comfort</li>
              <li>• Local craftsmanship and fair production</li>
            </ul>
          </div>
          <div className="rounded-xl p-5 bg-background outline-light">
            <div className="text-sm sm:text-base text-foreground font-medium">Our promise</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted">
              <li>• Honest pricing in PKR</li>
              <li>• Secure packaging and tracked delivery</li>
              <li>• Easy exchanges within 30 days</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
