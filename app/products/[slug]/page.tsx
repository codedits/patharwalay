import ProductDetailClient from "./product-detail-client";
import { connectToDatabase } from "@/lib/db";
import { Product as ProductModel, IProduct } from "@/models/Product";

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

  return <ProductDetailClient product={product} />;
}


