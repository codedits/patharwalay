import Image from "next/image";
import { polishImageUrl, shimmerDataURL } from "@/lib/images";
import { createBlurDataURL, imageSizes, imageProps } from "@/lib/image-utils";
import Link from "next/link";

export default function Hero({ imageUrl, headline, tagline, showCta = true, align = "left", size = "default", height = "normal" }: { imageUrl?: string; headline?: string; tagline?: string; showCta?: boolean; align?: "left" | "center"; size?: "default" | "lg"; height?: "short" | "normal" | "tall" | "70vh" }) {
  const heightClass = height === "short"
    ? "h-[32vh] sm:h-[40vh] md:h-[44vh]"
    : height === "tall"
    ? "h-[64vh] sm:h-[72vh] md:h-[78vh]"
    : height === "70vh"
    ? "h-[70vh]"
    : "h-[48vh] sm:h-[56vh] md:h-[64vh]";
  return (
    <section className="relative overflow-hidden full-bleed border-b border-black/10 dark:border-white/10 fade-in">
    {imageUrl ? (
        <Image
          // Use responsive transforms: smaller on mobile, larger on desktop
          src={polishImageUrl(imageUrl, ["c_fill", "g_auto"]) }
          alt="Gemstone banner"
          width={1920}
          height={960}
          {...imageProps.critical}
          blurDataURL={createBlurDataURL(40, 20)}
          sizes={imageSizes.fullBleed}
          className={`${heightClass} w-full object-cover`}
        />
      ) : (
        <div className={`${heightClass} w-full bg-background`} />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/30 dark:bg-black/50" />
      <div className={align === "center" ? "absolute inset-0 flex items-center" : "absolute inset-x-0 bottom-0"}>
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 md:pb-12 ${align === "center" ? "flex flex-col items-center text-center" : ""} fade-in`}>
          <h1 className={`lux-heading ${size === "lg" ? "text-4xl sm:text-5xl md:text-6xl" : "text-3xl sm:text-4xl md:text-5xl"} font-semibold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] max-w-3xl ${align === "center" ? "text-center mx-auto" : ""}`}>{headline || "Timeless Gems, Modern Elegance"}</h1>
          <p className={`mt-4 max-w-xl text-white/90 ${size === "lg" ? "text-base sm:text-lg" : "text-sm sm:text-base"} ${align === "center" ? "text-center mx-auto" : ""}`}>{tagline || "Handpicked gemstones set with precision—crafted to be worn, loved, and passed down."}</p>
         
        </div>
      </div>
    </section>
  );
}



