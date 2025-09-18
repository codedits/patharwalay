import ProductCard from "@/components/ProductCard";

export default function ProductGrid({ products }: { products: unknown[] }) {
  if (!products || products.length === 0) {
    return <div className="text-muted text-sm">No products found.</div>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
      {products.map((p) => {
        const o = p as Record<string, unknown>;
        type MaybeProduct = { _id?: string; slug?: string; id?: string };
        const maybe = o as MaybeProduct;
        const key = maybe._id ?? maybe.slug ?? maybe.id ?? Math.random().toString(36).slice(2, 9);
        const blur = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjAnIGhlaWdodD0nOTAnIHZpZXdCb3g9JzAgMCA2MCA5MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSdub25lJyA+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdnJz48c3RvcCBzdG9wLWNvbG9yPScjZjZmN2Y4JyBvZmZzZXQ9JzIwJScvPjxzdG9wIHN0b3AtY29sb3I9JyNlZGVlZjEnIG9mZnNldD0nNTAlJy8+PHN0b3Agc3RvcC1jb2xvcj0nI2Y2ZjdmOCcgb2Zmc2V0PSc3MCUnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nNjAnIGhlaWdodD0nOTAnIGZpbGw9JyNmNmY3ZjgnIC8+PHJlY3QgaWQ9J3InIHdpZHRoPSc2MCcgaGVpZ2h0PSc5MCcgZmlsbD0ndXJsKCNnKScgLz48YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTYwIiB0bz0iNjAiIGR1cj0iMS4yc2MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPjwvc3ZnPg==";
        return (
          <div key={key} className="transition-transform hover:scale-[1.02]">
            <ProductCard product={p} blurDataURL={blur} />
          </div>
        );
      })}
    </div>
  );
}
