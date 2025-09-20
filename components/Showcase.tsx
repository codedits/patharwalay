import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { createBlurDataURL, imageSizes, imageProps } from "@/lib/image-utils";

export default function Showcase() {
  return (
    <div className="space-y-16">
      {/* Storytelling blurb */}
      <Reveal delay={40}>
        <section className="mx-auto max-w-4xl px-6 text-center space-y-4">
          <h2 className="lux-heading text-2xl sm:text-3xl font-semibold tracking-tight">A Legacy of Elegance</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Every piece tells a story — crafted with precision, designed for timeless beauty, and
            made to be cherished for generations.
          </p>
        </section>
      </Reveal>

      {/* Full-width stacked categories */}
      <section className="space-y-6">
        <Reveal delay={120}>
          <Link
            href="/products?collection=rings"
            aria-label="Shop Rings"
            className="group relative block full-bleed h-[48vh] sm:h-[56vh] md:h-[64vh] overflow-hidden"
          >
          <Image
            src="ring-2405145_1920.jpg"
            alt="Emerald ring in velvet box"
            fill
            sizes={imageSizes.fullBleed}
            className="object-cover cover-mobile transition-transform duration-300 group-hover:scale-105"
            {...imageProps.lazy}
            blurDataURL={createBlurDataURL()}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white drop-shadow">
            <div className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">Rings</div>
            <span className="inline-block mt-1 text-xs underline underline-offset-4">Shop now</span>
          </div>
          </Link>
        </Reveal>

        <Reveal delay={200}>
          <Link
            href="/products?collection=gemstones"
            aria-label="Explore Gemstones"
            className="group relative block full-bleed h-[48vh] sm:h-[56vh] md:h-[64vh] overflow-hidden"
          >
          <Image
            src="herp.jpg"
            alt="Loose gemstones in natural light"
            fill
            sizes={imageSizes.fullBleed}
            className="object-cover cover-mobile transition-transform duration-300 group-hover:scale-105"
            {...imageProps.lazy}
            blurDataURL={createBlurDataURL()}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white drop-shadow">
            <div className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">Gemstones</div>
            <span className="inline-block mt-1 text-xs underline underline-offset-4">Explore</span>
          </div>
          </Link>
        </Reveal>

        <Reveal delay={280}>
          <Link
            href="/products?collection=necklaces"
            aria-label="Discover Necklaces"
            className="group relative block full-bleed h-[48vh] sm:h-[56vh] md:h-[64vh] overflow-hidden"
          >
          <Image
            src="https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3"
            alt="Necklace on minimal sculpture"
            fill
            sizes={imageSizes.fullBleed}
            className="object-cover cover-mobile transition-transform duration-300 group-hover:scale-105"
            {...imageProps.lazy}
            blurDataURL={createBlurDataURL()}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white drop-shadow">
            <div className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">Necklaces</div>
            <span className="inline-block mt-1 text-xs underline underline-offset-4">Discover</span>
          </div>
          </Link>
        </Reveal>
      </section>

      {/* Split image with copy */}
      <Reveal delay={360}>
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden order-2 lg:order-1">
            <Image
              src="ring-2522609_1920.jpg"
              alt="Artisan setting gemstones"
              fill
              sizes={imageSizes.split}
              className="object-cover cover-mobile"
              {...imageProps.lazy}
              blurDataURL={createBlurDataURL()}
            />
          </div>
          <div className="order-1 lg:order-2">
            <h3 className="lux-heading text-xl sm:text-2xl font-semibold">Crafted by Hand, Designed to Last</h3>
            <p className="text-muted mt-3">Our artisans bring decades of expertise to each piece — pairing ethically sourced gemstones with high-precision settings to ensure brilliance that stands the test of time.</p>
            <div className="mt-6">
              <Link href="/products" className="btn-glass rounded-md px-6 py-3">Explore the collection</Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Wide banner */}
      
    </div>
  );
}
