"use client";
import Image from "next/image";
import { polishImageUrl } from "@/lib/images";
import { motion } from "framer-motion";
import { formatPKR } from "@/lib/currency";

export type Product = { id: string; name: string; price: number; image: string };

type DBProduct = { _id?: string; title?: string; price?: number; imageUrl?: string; slug?: string; onSale?: boolean; inStock?: boolean };

export default function ProductCard({ product }: { product: unknown }) {
  const p = product as Product | DBProduct;
  const href = (p as DBProduct).slug || (p as Product).id || "";
  const imgArray = (p as unknown as { images?: string[] }).images || [];
  const rawImg = (p as DBProduct).imageUrl || imgArray[0] || (p as Product).image || "";
  const imgSrc = polishImageUrl(rawImg, ["c_fill", "g_auto", "w_640", "h_480"]);
  const title = (p as DBProduct).title || (p as Product).name || "product";
  const price = ((p as DBProduct).price || (p as Product).price || 0) as number;

  return (
  <motion.a
      className="group block overflow-hidden surface-card hover:-translate-y-0.5 w-[220px] sm:w-[260px] md:w-[280px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      whileHover={{ translateY: -2 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      href={`/products/${href}`}
    >
  <div className="relative aspect-[4/3] card-media max-w-full">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 260px, 220px"
            className="object-cover block max-w-full w-full h-full group-hover:scale-[1.03] transition-transform will-change-transform"
          />
        ) : (
          <div className="bg-gray-50 dark:bg-white/5 w-full h-full flex items-center justify-center text-muted">No image</div>
        )}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/90 text-xs bg-black/40 backdrop-blur px-1.5 py-0.5 rounded">View →</div>
      </div>
  <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="lux-heading font-medium tracking-tight text-base sm:text-lg group-hover:opacity-90 transition-opacity">{title}</h3>
          {(p as DBProduct).onSale ? <span className="badge badge-sale">SALE</span> : (p as DBProduct).inStock === false ? <span className="badge badge-out">OUT</span> : null}
        </div>
        <div className="mt-2 h-px bg-black/10 dark:bg-white/10" />
        <p className="mt-2 text-[13px] font-semibold text-foreground">{formatPKR(price)}</p>
      </div>
  </motion.a>
  );
}



