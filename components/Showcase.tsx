import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import { createBlurDataURL, imageSizes, imageProps } from "@/lib/image-utils";

export default function Showcase() {
  return (
    <div className="space-y-16">
      {/* Storytelling blurb */}
      <Reveal delay={40}>
        <section className="mx-auto max-w-4xl px-6 text-center space-y-4 fade-in" >
          <h2 className="lux-heading text-2xl sm:text-3xl font-semibold tracking-tight">Explore Categories</h2>
          <p className="text-muted max-w-2xl mx-auto">
            The Finest Jewllery Crafted to Last a Lifetime
          </p>
        </section>
      </Reveal>

      {/* Full-width stacked categories */}
      <section className="space-y-0">
        <Reveal delay={120}>
          <Link
            href="/rings"
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
          <div className="absolute inset-0 flex items-center justify-center text-center text-white drop-shadow px-4">
            <div>
              <div className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">Rings</div>
              <span className="inline-block mt-1 text-xs underline underline-offset-4">Shop now</span>
            </div>
          </div>
          </Link>
  </Reveal>

        <Reveal delay={200}>
          <Link
            href="/gemstones"
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
          <div className="absolute inset-0 flex items-center justify-center text-center text-white drop-shadow px-4">
            <div>
              <div className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">Gemstones</div>
              <span className="inline-block mt-1 text-xs underline underline-offset-4">Explore</span>
            </div>
          </div>
          </Link>
  </Reveal>

        <Reveal delay={280}>
          <Link
            href="/bracelets"
            aria-label="Discover Bracelets"
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
          <div className="absolute inset-0 flex items-center justify-center text-center text-white drop-shadow px-4">
            <div>
              <div className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">Bracelets</div>
              <span className="inline-block mt-1 text-xs underline underline-offset-4">Discover</span>
            </div>
          </div>
          </Link>
  </Reveal>
      </section>

      
      
      
    </div>
  );
}
