import Image from "next/image";
import { polishImageUrl } from "@/lib/images";
import { formatPKR } from "@/lib/currency";

export type Product = { id: string; name: string; price: number; image?: string; images?: string[]; slug?: string };

type DBProduct = { _id?: string; title?: string; price?: number; imageUrl?: string; slug?: string; onSale?: boolean; inStock?: boolean; images?: string[] };

export default function ProductCard({ product, blurDataURL }: { product: unknown; blurDataURL?: string }) {
  const p = product as Product | DBProduct;
  const href = (p as DBProduct).slug || (p as Product).slug || (p as Product).id || "";
  const imgArray = (p as DBProduct).images || (p as Product).images || [];
  const rawImg = (p as DBProduct).imageUrl || imgArray[0] || (p as Product).image || "";
  const imgSrc = polishImageUrl(rawImg, ["c_fill", "g_auto", "w_800", "h_600"]);
  const title = (p as DBProduct).title || (p as Product).name || "Product";
  const price = ((p as DBProduct).price || (p as Product).price || 0) as number;

  return (
  <a href={`/products/${href}`} className="block w-full no-underline font-poppins border border-white/20 dark:border-black/20 ">
      <div className="w-full bg-transparent">
        <div className="w-full h-48 sm:aspect-[4/3] sm:h-auto relative bg-gray-100 dark:bg-slate-800 overflow-hidden">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={title}
              fill
              loading="lazy"
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-black/60 dark:text-gray-300">No image</div>
          )}
        </div>

        <div className="mt-2 px-0">
          <h3 className="text-sm font-medium leading-tight text-foreground">{title}</h3>
            <div className="mt-1 text-sm  font-poppins font-semibold" >{formatPKR(price)}</div>
        </div>
      </div>
    </a>
  );
}



