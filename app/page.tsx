import Hero from "@/components/Hero";
import { ISiteSettings } from "@/models/SiteSettings";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import type { Metadata } from "next";

export const dynamic = "auto";

// About and Contact sections removed from the main page
import { Product } from "@/models/Product";
import Showcase from "@/components/Showcase";

export default async function Home() {
  let doc: ISiteSettings | null = null;
  let products: unknown[] = [];
  if (process.env.MONGODB_URI) {
    try {
      // Connect once and run both queries in parallel to reduce overall latency
      await connectToDatabase();
      const projection = { title: 1, price: 1, images: 1, imageUrl: 1, slug: 1, onSale: 1, inStock: 1, featured: 1 };
      const [docRes, prodRes] = await Promise.allSettled([
        SiteSettings.findOne().lean<ISiteSettings>(),
        Product.find({ featured: true }, projection).sort({ createdAt: -1 }).limit(8).lean(),
      ]);
      if (docRes.status === "fulfilled" && docRes.value) {
        doc = docRes.value as ISiteSettings;
        if (doc && !doc.heroHeadline) {
          const rec = doc as unknown as Record<string, unknown>;
          const legacy = rec.heroHeadLine;
          if (typeof legacy === "string") {
            doc.heroHeadline = legacy;
          }
        }
      }
      if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) {
        const raw = prodRes.value as unknown[];
        products = raw.map((p) => {
          const r = p as unknown as Record<string, unknown>;
          return { ...r, _id: r._id ? String(r._id) : undefined };
        }) as unknown[];
      }
    } catch {
      // fall back to defaults when DB is unavailable
      doc = null;
      products = [];
    }
  }
  // fallback to sample featured products when DB is empty/unavailable
  if (!products || products.length === 0) {
  const samples = (await import("@/lib/products")).featuredProducts;
  products = samples as unknown[];
  }

  return (
  <div className="space-y-12">
    <Hero imageUrl={doc?.heroImageUrl} headline={doc?.heroHeadline} height="70vh" />

  {/* Premium showcase sections */}
  <Showcase />
  {/* Second hero below Featured (individual content) */}
  { (doc?.hero2ImageUrl || doc?.hero2Headline || doc?.hero2Tagline) ? (
  <Hero imageUrl={doc?.hero2ImageUrl} headline={doc?.hero2Headline} tagline={doc?.hero2Tagline} showCta={false} align="center" size="lg" />
  ) : null }
  {/* About and Contact sections intentionally removed from home page */}
      
    </div>
  );
}

export const metadata: Metadata = {
  title: "Patthar Walay",
  description: "Ethically sourced gemstones and handcrafted jewelry. Discover rings, pendants, and more.",
  alternates: { canonical: "/" },
};
