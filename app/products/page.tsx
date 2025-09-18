import ProductGrid from "@/components/ProductGrid";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { SiteSettings } from "@/models/SiteSettings";
import Hero from "@/components/Hero";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

function escapeRegex(input: string) {
  // Escape regex special chars to prevent ReDoS and malformed queries
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  let products: unknown[] = [];
  let settings: { productsHeroImageUrl?: string; productsHeroHeadline?: string; productsHeroTagline?: string } | null = null;
  const sp = (searchParams ? await searchParams : {}) || {};
  const qRaw = (sp.q as string) || (Array.isArray(sp.q) ? (sp.q[0] as string) : "") || "";
  const q = qRaw.trim();
  try {
    if (process.env.MONGODB_URI) {
  await connectToDatabase();
  settings = await SiteSettings.findOne().lean<{ productsHeroImageUrl?: string; productsHeroHeadline?: string; productsHeroTagline?: string }>();
      const filter = q
        ? {
            $or: [
              { title: { $regex: escapeRegex(q), $options: "i" } },
              { description: { $regex: escapeRegex(q), $options: "i" } },
            ],
          }
        : {};
  const projection = { title: 1, price: 1, images: 1, imageUrl: 1, slug: 1, onSale: 1, inStock: 1 };
  const raw = await Product.find(filter, projection).sort({ createdAt: -1 }).lean();
      products = raw.map((p) => {
        const r = p as unknown as Record<string, unknown>;
        return { ...r, _id: r._id ? String(r._id) : undefined };
      }) as unknown[];
    }
  } catch {
    products = [];
  }

  return (
    <div className="space-y-8">
      {settings?.productsHeroImageUrl || settings?.productsHeroHeadline || settings?.productsHeroTagline ? (
        <Hero imageUrl={settings?.productsHeroImageUrl} headline={settings?.productsHeroHeadline} tagline={settings?.productsHeroTagline} align="center" height="short" showCta={false} />
      ) : null}
  <div className="mt-8 sm:mt-10" />
  <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="lux-heading text-2xl sm:text-3xl font-semibold tracking-tight heading-underline">All Products</h1>
          <p className="text-muted">{q ? `Showing results for “${q}”` : "Explore our curated gemstone selection."}</p>
        </div>
      </div>

  <div className="w-full">
    <ProductGrid products={products as unknown[]} />
  </div>
    </div>
  );
}

export async function generateMetadata({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
  const sp = (searchParams ? await searchParams : {}) || {};
  const qRaw = (sp.q as string) || (Array.isArray(sp.q) ? (sp.q[0] as string) : "") || "";
  const q = qRaw.trim();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const baseTitle = "All Products";
  const title = q ? `${baseTitle} – ${q}` : baseTitle;
  const canonical = q ? `${site}/products?q=${encodeURIComponent(q)}` : `${site}/products`;
  return {
    title,
    description: q ? `Search results for “${q}”.` : "Browse our full gemstone collection.",
    alternates: { canonical },
    openGraph: { title, description: q ? `Search results for “${q}”.` : "Browse our full gemstone collection.", url: canonical },
    twitter: { card: "summary_large_image", title },
  };
}


