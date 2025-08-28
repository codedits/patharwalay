import ProductDetailClient from "./product-detail-client";
import { connectToDatabase } from "@/lib/db";
import { Product as ProductModel, IProduct } from "@/models/Product";
import { shimmerDataURL } from "@/lib/images";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;

  let product: IProduct | null = null;
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      const raw = await ProductModel.findOne({ slug }).lean();
      if (raw) {
        const r = raw as unknown as Record<string, unknown>;
        product = {
          title: typeof r.title === "string" ? r.title : "",
          description: typeof r.description === "string" ? r.description : undefined,
          price: typeof r.price === "number" ? r.price : 0,
          imageUrl: typeof r.imageUrl === "string" ? r.imageUrl : undefined,
          images: Array.isArray(r.images) ? (r.images as string[]) : undefined,
          category: typeof r.category === "string" ? r.category : undefined,
          slug: typeof r.slug === "string" ? r.slug : "",
          onSale: typeof r.onSale === "boolean" ? r.onSale : undefined,
          inStock: typeof r.inStock === "boolean" ? r.inStock : undefined,
          _id: r._id ? String(r._id) : undefined,
        } as IProduct;
      }
    }
  } catch {
    product = null;
  }

  if (!product) {
    // fallback to sample products
    const samples = (await import("@/lib/products")).featuredProducts;
    const sample = samples.find((s) => s.id === slug);
    if (sample) product = { title: sample.name, price: sample.price, imageUrl: sample.image, slug: sample.id } as IProduct;
  }

  // Attach a server-side blur placeholder for initial render (portrait 2:3)
  const blur = shimmerDataURL(60, 90);
  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product?.title || "Product",
    description: product?.description || undefined,
    image: product?.images?.length ? product.images : (product?.imageUrl ? [product.imageUrl] : undefined),
    offers: {
      "@type": "Offer",
      price: product?.price ?? undefined,
      priceCurrency: "PKR",
      availability: product?.inStock === false ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient product={product} initialBlurDataURL={blur} />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let doc: IProduct | null = null;
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();
      doc = await ProductModel.findOne({ slug }).lean<IProduct | null>();
    }
  } catch {
    doc = null;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title = doc?.title ? `${doc.title}` : "Product";
  const description = doc?.description || "View details and pricing for this item.";
  const canonical = `${site}/products/${slug}`;
  const image = (doc?.images?.[0] || doc?.imageUrl) as string | undefined;
  const ogImages = image ? [{ url: image, width: 1200, height: 630 }] : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: doc?.title || "Product",
    description,
    image: image ? [image] : [],
    offers: { "@type": "Offer", price: doc?.price ?? 0, priceCurrency: "PKR", availability: doc?.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
    url: canonical,
  };
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", images: ogImages },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}


