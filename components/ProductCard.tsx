"use client";
import Image from "next/image";
import { polishImageUrl } from "@/lib/images";
import { motion } from "framer-motion";
import { formatPKR } from "@/lib/currency";

export type Product = { id: string; name: string; price: number; image: string };

type DBProduct = { _id?: string; title?: string; price?: number; imageUrl?: string; slug?: string; onSale?: boolean; inStock?: boolean };

export default function ProductCard({ product, blurDataURL }: { product: unknown; blurDataURL?: string }) {
  const p = product as Product | DBProduct;
  const href = (p as DBProduct).slug || (p as Product).id || "";
  const imgArray = (p as unknown as { images?: string[] }).images || [];
  const rawImg = (p as DBProduct).imageUrl || imgArray[0] || (p as Product).image || "";
  // Use a taller portrait crop for cards to look more like portrait images
  const imgSrc = polishImageUrl(rawImg, ["c_fill", "g_auto", "w_480", "h_720"]);
  const title = (p as DBProduct).title || (p as Product).name || "product";
  const price = ((p as DBProduct).price || (p as Product).price || 0) as number;

  return (
  <motion.a
      className="group block overflow-hidden surface-card light-shadow hover:-translate-y-0.5 w-full min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      style={{ borderRadius: "0.24rem" }}
  initial={{ opacity: 0, y: 8 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-10%" }}
      whileHover={{ translateY: -2 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
      href={`/products/${href}`}
    >
  <div className="relative aspect-[2/3] card-media max-w-full" style={{ borderRadius: "0.24rem" }}>
    {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      placeholder={blurDataURL ? "blur" : undefined}
      blurDataURL={blurDataURL}
            className="object-cover block max-w-full w-full h-full group-hover:scale-[1.03] transition-transform will-change-transform"
          />
        ) : (
          <div className="bg-gray-50 dark:bg-white/5 w-full h-full flex items-center justify-center text-muted">No image</div>
        )}
        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/30 transition-colors" />
          {/* Badges top-left */}
          {(p as DBProduct).onSale ? (
            <span className="absolute top-2 left-2 badge badge-sale">SALE</span>
          ) : (p as DBProduct).inStock === false ? (
            <span className="absolute top-2 left-2 badge badge-out">OUT</span>
          ) : null}
          {/* View hint top-right on hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/90 text-xs bg-black/40 backdrop-blur px-1.5 py-0.5 rounded">View →</div>
          {/* Title & price bottom */}
          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
            <div className="flex items-start justify-between gap-3">
<h3 className="lux-heading font-medium tracking-tight text-base sm:text-lg truncate drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">{title}</h3>
            </div>
            <p className="mt-1 text-[13px] font-semibold drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)]">{formatPKR(price)}</p>          </div>
        </div>
      </div>
  </motion.a>
  );
}



