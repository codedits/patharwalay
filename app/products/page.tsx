import ProductCard from "@/components/ProductCard";
import ProductGridClient from "@/components/ProductGridClient";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { SiteSettings } from "@/models/SiteSettings";
import Hero from "@/components/Hero";

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
      {/* client-side grid will retry fetching if SSR returned no products */}
      <ProductGridClient initialProducts={products} endpoint="/api/products" />
  </div>
    </div>
  );
}


