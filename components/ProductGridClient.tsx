"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

type Props = {
  initialProducts?: unknown[];
  endpoint?: string;
};

export default function ProductGridClient({ initialProducts = [], endpoint = "/api/products" }: Props) {
  const [products, setProducts] = useState<unknown[]>(initialProducts || []);
  const [loading, setLoading] = useState(products.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchWithRetry(attempts = 3) {
      setLoading(true);
      for (let i = 1; i <= attempts; i++) {
        try {
          const controller = new AbortController();
          const to = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(endpoint, { signal: controller.signal });
          clearTimeout(to);
          if (!res.ok) throw new Error(`status ${res.status}`);
          const data = await res.json();
          if (!mounted) return;
          if (Array.isArray(data) && data.length) {
            setProducts(data);
            setError(null);
            setLoading(false);
            return;
          }
          // if empty, treat as transient and retry
          throw new Error("empty");
        } catch (err) {
          if (i === attempts) {
            if (!mounted) return;
            setError(String(err));
            setLoading(false);
            return;
          }
          // backoff
          await new Promise((r) => setTimeout(r, 300 * Math.pow(2, i - 1)));
        }
      }
    }

    // Only fetch client-side if initialProducts is empty
    if (!initialProducts || initialProducts.length === 0) fetchWithRetry(4).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [endpoint, initialProducts]);

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[320px] bg-black/5 animate-pulse" />)}</div>;
  }

  if (error && products.length === 0) {
    return <div className="text-muted">Products are temporarily unavailable. Try refreshing or check back shortly.</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
      {products.map((p) => {
        const key = (() => {
          const o = p as Record<string, unknown>;
          if (typeof o._id === "string") return o._id;
          if (typeof o.slug === "string") return o.slug;
          if (typeof o.id === "string") return o.id;
          return Math.random().toString(36).slice(2, 9);
        })();
  // Provide a default shimmer blur for cards (portrait 2:3)
  const blur = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjAnIGhlaWdodD0nOTAnIHZpZXdCb3g9JzAgMCA2MCA5MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSdub25lJyA+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSdnJz48c3RvcCBzdG9wLWNvbG9yPScjZjZmN2Y4JyBvZmZzZXQ9JzIwJScvPjxzdG9wIHN0b3AtY29sb3I9JyNlZGVlZjEnIG9mZnNldD0nNTAlJy8+PHN0b3Agc3RvcC1jb2xvcj0nI2Y2ZjdmOCcgb2Zmc2V0PSc3MCUnLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0nNjAnIGhlaWdodD0nOTAnIGZpbGw9JyNmNmY3ZjgnIC8+PHJlY3QgaWQ9J3InIHdpZHRoPSc2MCcgaGVpZ2h0PSc5MCcgZmlsbD0ndXJsKCNnKScgLz48YW5pbWF0ZSB4bGluazpocmVmPSIjciIgYXR0cmlidXRlTmFtZT0ieCIgZnJvbT0iLTYwIiB0bz0iNjAiIGR1cj0iMS4yc yIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIC8+PC9zdmc+";
  return <ProductCard key={key} product={p} blurDataURL={blur} />;
      })}
    </div>
  );
}
