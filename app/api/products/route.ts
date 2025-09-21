import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { ensureAdmin } from "@/lib/auth";
import { escapeRegex, sanitizeProductInput } from "@/lib/validation";

// Small in-memory cache keyed by query params; TTL is short to keep data fresh.
const productCache = new Map<string, { ts: number; data: unknown[] }>();
const CACHE_TTL_MS = 2000; // 2 seconds

export async function GET(req: Request) {
  const now = Date.now();
  await connectToDatabase();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const rawCategory = (url.searchParams.get("category") || "").trim().toLowerCase();
  const category = (() => {
    if (!rawCategory) return "";
    if ((["all", "*"] as string[]).includes(rawCategory)) return "";
    if (["uncategorized", "none", "empty", "null"].includes(rawCategory)) return "uncategorized";
    if (["gem", "gems", "gemstone", "gemstones"].includes(rawCategory)) return "gemstone";
    if (["ring", "rings"].includes(rawCategory)) return "ring";
    if (["bracelet", "bracelets", "bangle", "bangles"].includes(rawCategory)) return "bracelet";
    return rawCategory; // fall back to raw for custom categories
  })();
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "24", 10) || 24));
  const skip = (page - 1) * pageSize;
  const key = JSON.stringify({ q, category, page, pageSize });
  const cached = productCache.get(key);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  const projection = { title: 1, price: 1, images: 1, imageUrl: 1, slug: 1, category: 1, onSale: 1, inStock: 1, featured: 1, createdAt: 1 } as const;
  const parts: Record<string, unknown>[] = [];
  if (q) {
    parts.push({ $or: [ { title: { $regex: escapeRegex(q), $options: "i" } }, { description: { $regex: escapeRegex(q), $options: "i" } } ] });
  }
  if (category) {
    if (category === "uncategorized") {
      parts.push({ $or: [ { category: { $exists: false } }, { category: "" } ] });
    } else {
      parts.push({ category: { $regex: new RegExp(`^${escapeRegex(category)}`, "i") } });
    }
  }
  const filter = parts.length ? { $and: parts } : {};
  const items = await Product.find(filter, projection).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean();

  // cache a shallow copy for the specific key
  productCache.set(key, { ts: Date.now(), data: Array.isArray(items) ? items.slice(0, 2000) : [] });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const guard = await ensureAdmin(req);
  if (guard) return guard;
  await connectToDatabase();
  const raw = await req.json().catch(() => null);
  const parsed = sanitizeProductInput(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.value;

  // avoid slug collisions: append short suffix if slug already exists
  if (body.slug) {
    let candidate = body.slug;
    let count = 0;
    while (await Product.findOne({ slug: candidate })) {
      count += 1;
      candidate = `${body.slug}-${Math.random().toString(36).slice(2, 5)}`;
      if (count > 5) break;
    }
    body.slug = candidate;
  }

  try {
    const created = await Product.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}



