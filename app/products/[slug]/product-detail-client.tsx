"use client";
import Image from "next/image";
import { polishImageUrl } from "@/lib/images";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { IProduct } from "@/models/Product";
import { formatPKR } from "@/lib/currency";
import { motion } from "framer-motion";

export default function ProductDetailClient({ product, initialBlurDataURL }: { product?: IProduct | null; initialBlurDataURL?: string }) {
  const title = product?.title || (product?.slug || "").replace(/-/g, " ");
  const images: string[] = (() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length) return product.images.slice(0, 7);
    if (product.imageUrl) return [product.imageUrl];
    // sample fallback uses `image` key
    const maybe = product as unknown as Record<string, unknown>;
    if (typeof maybe.image === "string") return [maybe.image as string];
    return [];
  })();

  const [index, setIndex] = useState(0);
  const price = typeof product?.price === "number" ? product.price : 0;

  useEffect(() => {
    setIndex(0);
  }, [product]);

  // Preload adjacent images to make next/prev feel snappier
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const nextIdx = (index + 1) % images.length;
    const prevIdx = (index - 1 + images.length) % images.length;
    const preloads: HTMLImageElement[] = [];
    try {
      [nextIdx, prevIdx].forEach((i) => {
        const url = polishImageUrl(images[i], ["c_fill", "g_auto", "w_900", "h_1350"]);
        const img = typeof document !== "undefined" ? document.createElement("img") as HTMLImageElement : null;
        if (img) {
          img.src = url;
          preloads.push(img);
        }
      });
  } catch {
      // ignore preload failures
    }
    return () => {
      // drop references (browser may still keep them cached)
      preloads.length = 0;
    };
  }, [index, images]);

  // LQIP: fetch a very small blurred image and set it as blurDataURL for Next/Image
  const [blurDataUrl, setBlurDataUrl] = useState<string | undefined>(initialBlurDataURL);
  useEffect(() => {
    let cancelled = false;
    async function makeLQIP() {
      if (!images || !images.length) return setBlurDataUrl(undefined);
      try {
        // very small, low-quality transform for a fast tiny preview
        const tiny = polishImageUrl(images[index], ["c_fill", "g_auto", "w_40", "h_60", "q_1"]);
        const res = await fetch(tiny, { cache: "force-cache" });
        if (!res.ok) return;
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (cancelled) return;
          const data = reader.result as string | null;
          if (data) setBlurDataUrl(data);
        };
        reader.readAsDataURL(blob);
  } catch {
        // ignore
      }
    }
    // If we already have a server-provided blur, keep it for first image; refresh when index changes
    if (!initialBlurDataURL || index !== 0) {
      makeLQIP();
    }
    return () => { cancelled = true; };
  }, [index, images, initialBlurDataURL]);

  // Preconnect to Cloudinary and preload the current main image for faster startup
  useEffect(() => {
    if (typeof document === "undefined" || !images || !images.length) return;
    const host = "https://res.cloudinary.com";
    // add preconnect if missing
    if (!document.querySelector(`link[rel=\"preconnect\"][href=\"${host}\"]`)) {
      const pc = document.createElement("link");
      pc.rel = "preconnect";
      pc.href = host;
      pc.crossOrigin = "anonymous";
      document.head.appendChild(pc);
    }
    // preload current image
    const mainUrl = polishImageUrl(images[index], ["c_fill", "g_auto", "w_900", "h_1350"]);
    // remove existing preload for our image if present
    const existing = document.querySelectorAll('link[rel="preload"][as="image"]');
    existing.forEach((n) => {
      if (n.getAttribute("data-pw-preload") === "1") n.remove();
    });
    const pl = document.createElement("link");
    pl.rel = "preload";
    pl.as = "image";
    pl.href = mainUrl;
    pl.setAttribute("data-pw-preload", "1");
    document.head.appendChild(pl);
    return () => {
      // cleanup preload for this index when unmounting/changing
      try { pl.remove(); } catch {}
    };
  }, [index, images]);

  function handleBuyNow() {
    try {
      const phone = "923440701990"; // admin WhatsApp number (international, no +)
      const productLink = typeof window !== "undefined" ? window.location.href : "";
      const message = `Hello, I want to buy this product: ${productLink}`;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    } catch (err) {
      // fail silently in SSR or restricted environments
  console.error("Failed to open WhatsApp link", err);
    }
  }

  function prev() {
    setIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  }
  function next() {
    setIndex((i) => (images.length ? (i + 1) % images.length : 0));
  }
  return (
    <div className="mt-4 sm:mt-6 space-y-6">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1">
          <li><Link href="/" className="hover:opacity-80">Home</Link></li>
          <li aria-hidden className="px-1">/</li>
          <li><Link href="/products" className="hover:opacity-80">Products</Link></li>
          <li aria-hidden className="px-1">/</li>
          <li className="capitalize text-foreground">{title}</li>
        </ol>
      </nav>
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8" initial="hidden" animate="show" variants={{ hidden: { }, show: { transition: { staggerChildren: 0.06 } } }}>
        <div>
          <motion.div className="relative overflow-hidden surface-card" variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } }}>
            {images.length ? (
              // make carousel taller (portrait 2:3) so product images are more prominent
              <div className="relative" style={{ paddingTop: "150%" }}>
                <Image
                  src={polishImageUrl(images[index], ["c_fill", "g_auto", "w_900", "h_1350"]) }
                  alt={`${title} ${index + 1}`}
                  fill
                  priority={index === 0}
                  placeholder={blurDataUrl ? "blur" : undefined}
                  blurDataURL={blurDataUrl}
                  sizes="(min-width: 1024px) 600px, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
                <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm" onClick={prev} aria-label="Previous">‹</button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm" onClick={next} aria-label="Next">›</button>
              </div>
            ) : (
              <div className="relative aspect-[2/3] overflow-hidden surface-card flex items-center justify-center text-muted">No image</div>
            )}
          </motion.div>
            {images.length > 1 ? (
            <motion.div className="flex gap-2 mt-3" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}>
              {images.map((img, i) => (
        <button key={img} onClick={() => setIndex(i)} className={`rounded overflow-hidden border ${i === index ? "ring-2 ring-black/20 dark:ring-white/30" : "border-black/10 dark:border-white/10"}`}>
                  <div style={{ width: 80, height: 120, position: "relative" }}>
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.98 }}>
            <Image src={polishImageUrl(img, ["c_fill", "g_auto", "w_160", "h_240"]) } alt={`thumb-${i}`} fill sizes="80px" className="object-cover" />
          </motion.div>
                  </div>
                </button>
              ))}
            </motion.div>
          ) : null}
        </div>
        <motion.div className="space-y-4" variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } }}>
                <h1 className="lux-heading text-3xl font-semibold tracking-tight capitalize">{title}</h1>
                {/* Description will be shown in the details block below */}
                <div className="text-xl font-semibold">{formatPKR(price)}</div>
          <div className="flex items-center gap-1 text-accent" aria-label="Rating 4.8 out of 5">
            <span>★</span><span>★</span><span>★</span><span>★</span><span className="opacity-50">★</span>
            <span className="ml-2 text-xs text-muted">4.8 (128)</span>
          </div>
          <div className="pt-2">
            <motion.button
              className="btn-red red-glow"
              whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              onClick={handleBuyNow}
              aria-label="Buy now via WhatsApp"
            >
              Buy now
            </motion.button>
          </div>
          <div className="pt-6 text-sm leading-6">
            {product?.description ? (
              <p>{product.description}</p>
            ) : (
              <p>
                Placeholder details. You can later fetch product info from MongoDB and images
                from Cloudinary. This route is ready for dynamic data.
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

