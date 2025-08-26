import Link from "next/link";
import Hero from "@/components/Hero";
import { ISiteSettings } from "@/models/SiteSettings";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

export const dynamic = "force-dynamic";
import ProductCard from "@/components/ProductCard";
import About from "@/components/About";
import { Product } from "@/models/Product";

export default async function Home() {
  let doc: ISiteSettings | null = null;
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      doc = await SiteSettings.findOne().lean<ISiteSettings>();
      // normalize legacy casing from DB: heroHeadLine -> heroHeadline
      if (doc && (doc as unknown as Record<string, unknown>).heroHeadLine && !doc.heroHeadline) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        doc.heroHeadline = (doc as any).heroHeadLine as string;
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
      const raw = await Product.find().sort({ createdAt: -1 }).limit(8).lean();
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
              {products.map((p) => {
            function getId(x: unknown) {
              if (!x || typeof x !== "object") return Math.random().toString(36).slice(2, 9);
              const o = x as Record<string, unknown>;
              if (o._id) {
                // _id from Mongo may be an ObjectId  call toString if available
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const maybe = (o._id as any);
                if (typeof maybe === "string") return maybe;
                if (maybe && typeof maybe.toString === "function") return maybe.toString();
              }
              if (typeof o.id === "string") return o.id;
              if (typeof o.slug === "string") return o.slug;
              return Math.random().toString(36).slice(2, 9);
            }
            const id = getId(p);
            return <ProductCard key={id} product={p} />;
              })}
            </div>
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
