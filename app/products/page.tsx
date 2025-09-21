import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  // Since we currently only have gemstones, redirect to gemstones page
  const sp = (searchParams ? await searchParams : {}) || {};
  const qRaw = (sp.q as string) || (Array.isArray(sp.q) ? (sp.q[0] as string) : "") || "";
  const q = qRaw.trim();
  
  // Preserve search query if present
  const redirectUrl = q ? `/gemstones?q=${encodeURIComponent(q)}` : "/gemstones";
  redirect(redirectUrl);
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
    description: q ? `Search results for "${q}".` : "Browse our complete jewelry collection by category.",
    alternates: { canonical },
    openGraph: { title, description: q ? `Search results for "${q}".` : "Browse our complete jewelry collection by category.", url: canonical },
    twitter: { card: "summary_large_image", title },
  };
}