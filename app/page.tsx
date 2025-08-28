import Link from "next/link";
import Hero from "@/components/Hero";
import { ISiteSettings } from "@/models/SiteSettings";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import About from "@/components/About";
import { Product } from "@/models/Product";
import ProductGridClient from "@/components/ProductGridClient";

export default async function Home() {
  let doc: ISiteSettings | null = null;
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      doc = await SiteSettings.findOne().lean<ISiteSettings>();
      // normalize legacy casing from DB: heroHeadLine -> heroHeadline
      if (doc && !doc.heroHeadline) {
        const rec = doc as unknown as Record<string, unknown>;
        const legacy = rec.heroHeadLine;
        if (typeof legacy === "string") {
          doc.heroHeadline = legacy;
        }
      }
    }
  } catch {
    // fall back to defaults when DB is unavailable during build
    doc = null;
  }
  let products: unknown[] = [];
  try {
    if (process.env.MONGODB_URI) {
  await connectToDatabase();
  const projection = { title: 1, price: 1, images: 1, imageUrl: 1, slug: 1, onSale: 1, inStock: 1 };
  const raw = await Product.find({}, projection).sort({ createdAt: -1 }).limit(8).lean();
      // convert ObjectId to string to ensure serializable plain object
      products = raw.map((p) => {
        const r = p as unknown as Record<string, unknown>;
        return { ...r, _id: r._id ? String(r._id) : undefined };
      }) as unknown[];
    }
  } catch {
    products = [];
  }
  // fallback to sample featured products when DB is empty/unavailable
  if (!products || products.length === 0) {
  const samples = (await import("@/lib/products")).featuredProducts;
  products = samples as unknown[];
  }

  return (
  <div className="space-y-12">
      <Hero imageUrl={doc?.heroImageUrl} headline={doc?.heroHeadline} />

  <section id="collections" className="space-y-6">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-end justify-between gap-4">
          <h2 className="lux-heading text-xl sm:text-2xl font-semibold tracking-tight heading-underline">Featured Pieces</h2>
          <Link href="/products" className="text-sm hover:opacity-80 hidden sm:inline">View all</Link>
        </div>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 outline-light">
          {products.length ? (
            <ProductGridClient initialProducts={products} />
          ) : (
            <div className="text-muted">No products yet.</div>
          )}
        </div>
  </section>
  {/* Second hero below Featured (individual content) */}
  { (doc?.hero2ImageUrl || doc?.hero2Headline || doc?.hero2Tagline) ? (
  <Hero imageUrl={doc?.hero2ImageUrl} headline={doc?.hero2Headline} tagline={doc?.hero2Tagline} showCta={false} align="center" size="lg" />
  ) : null }
  <About />
      
    </div>
  );
}

export const metadata: Metadata = {
  title: "Timeless Gems & Fine Jewelry",
  description: "Ethically sourced gemstones and handcrafted jewelry. Discover rings, pendants, and more.",
  alternates: { canonical: "/" },
};
