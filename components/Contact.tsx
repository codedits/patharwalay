export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-xl p-6 bg-background outline-light">
        <h2 id="contact-heading" className="lux-heading text-xl sm:text-2xl font-semibold tracking-tight mb-2 heading-underline">Contact</h2>
  <p className="text-sm text-muted mb-4">Have a question about a piece or need help with an order? Reach out and we will respond within 1-2 business days.</p>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">Prefer messaging? Reach us on WhatsApp:</p>
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block btn-outline w-full text-center"
          >
            WhatsApp: 923001234567
          </a>
        </div>
      </div>
    </section>
  );
}
