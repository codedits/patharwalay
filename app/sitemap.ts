import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://patharwalay.vercel.app";
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const items = await Product.find({}, { slug: 1, updatedAt: 1 }).sort({ updatedAt: -1 }).limit(5000).lean();
      for (const it of items) {
        const slug = (it as { slug?: string }).slug;
        if (typeof slug === "string" && slug) {
          urls.push({
            url: `${base}/products/${slug}`,
            lastModified: (it as { updatedAt?: Date }).updatedAt || new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    // ignore db errors; return base urls
  }
  return urls;
}
