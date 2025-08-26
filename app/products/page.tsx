import ProductCard from "@/components/ProductCard";
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
      const raw = await Product.find(filter).sort({ createdAt: -1 }).lean();
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {products.length ? (
          products.map((p) => {
            const key = (() => {
              const o = p as Record<string, unknown>;
              if (typeof o._id === "string") return o._id;
              if (typeof o.slug === "string") return o.slug;
              if (typeof o.id === "string") return o.id;
              return Math.random().toString(36).slice(2, 9);
            })();
            return <ProductCard key={key} product={p} />;
          })
        ) : (
          <div className="text-muted">{q ? "No matching products found." : "No products yet."}</div>
        )}
      </div>
  </div>
    </div>
  );
}


