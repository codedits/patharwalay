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
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 300 * Math.pow(2, i - 1)));
        }
      }
    }

    // Only fetch client-side if initialProducts is empty
    if (!initialProducts || initialProducts.length === 0) fetchWithRetry(4).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [endpoint]);

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
        return <ProductCard key={key} product={p} />;
      })}
    </div>
  );
}
