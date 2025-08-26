"use client";
import Image from "next/image";
import { polishImageUrl } from "@/lib/images";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero({ imageUrl, headline, tagline, showCta = true, align = "left", size = "default" }: { imageUrl?: string; headline?: string; tagline?: string; showCta?: boolean; align?: "left" | "center"; size?: "default" | "lg" }) {
  return (
    <section className="relative overflow-hidden full-bleed border-b border-black/10 dark:border-white/10">
    {imageUrl ? (
        <Image
      src={polishImageUrl(imageUrl, ["c_fill", "g_auto", "w_1920", "h_960"]) }
          alt="Gemstone banner"
          width={1920}
          height={720}
          priority
          sizes="100vw"
          className="h-[48vh] sm:h-[56vh] md:h-[64vh] w-full object-cover"
        />
      ) : (
        <div className="h-[48vh] sm:h-[56vh] md:h-[64vh] w-full bg-background" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-black/30 dark:bg-black/50" />
  <div className={align === "center" ? "absolute inset-0 flex items-center" : "absolute inset-x-0 bottom-0"}>
        <motion.div
          className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 md:pb-12 ${align === "center" ? "flex flex-col items-center text-center" : ""}`}
          initial="hidden"
          animate="show"
          variants={{
            hidden: { },
            show: { transition: { staggerChildren: 0.08 } }
          }}
        >
          <motion.h1
            className={`lux-heading ${size === "lg" ? "text-4xl sm:text-5xl md:text-6xl" : "text-3xl sm:text-4xl md:text-5xl"} font-semibold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] max-w-3xl ${align === "center" ? "text-center mx-auto" : ""}`}
            variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } }}
          >
            {headline || "Timeless Gems, Modern Elegance"}
          </motion.h1>
          <motion.p
            className={`mt-4 max-w-xl text-white/90 ${size === "lg" ? "text-base sm:text-lg" : "text-sm sm:text-base"} ${align === "center" ? "text-center mx-auto" : ""}`}
            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } }}
          >
            {tagline || "Handpicked gemstones set with precision—crafted to be worn, loved, and passed down."}
          </motion.p>
          {showCta && (
            <motion.div className="mt-6" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href="/products" className="btn-red red-glow">Shop now</Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}



