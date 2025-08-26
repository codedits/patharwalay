import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import type { IProduct } from "@/models/Product";
import cloudinaryImport from "cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CloudinaryV2 = typeof cloudinaryImport.v2;
const cloudinary: CloudinaryV2 = (cloudinaryImport as unknown as { v2: CloudinaryV2 }).v2;
cloudinary.config({ secure: true });

function getCloudinaryPublicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("res.cloudinary.com")) return null;
    const marker = "/upload/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    let rest = u.pathname.slice(idx + marker.length); // e.g. v1234/products/abc.jpg
    // remove version segment if present
    rest = rest.replace(/^v\d+\//, "");
    // strip extension from last segment
    const dot = rest.lastIndexOf(".");
    if (dot !== -1) rest = rest.slice(0, dot);
    // decode URI components for folder names
    return decodeURIComponent(rest);
  } catch {
    return null;
  }
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  const item = await Product.findById(id).lean();
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  const body = await req.json();
  // fetch previous to detect removed images for cleanup
  const prev = (await Product.findById(id).lean()) as IProduct | null;
  if (body.images && !Array.isArray(body.images)) {
    body.images = [String(body.images)];
  }
  if (Array.isArray(body.images)) {
    body.images = Array.from(new Set(body.images.filter(Boolean).map(String))).slice(0, 7);
  }
  // If the product has no slug (legacy or removed), generate one from title
  if (!body.slug && body.title) {
    body.slug = String(body.title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  // avoid slug collisions: append short suffix if slug would collide (excluding current doc)
  if (body.slug) {
    let candidate = body.slug;
    let count = 0;
    while (await Product.findOne({ slug: candidate, _id: { $ne: id } })) {
      count += 1;
      candidate = `${body.slug}-${Math.random().toString(36).slice(2, 5)}`;
      if (count > 5) break;
    }
    body.slug = candidate;
  }
  const updated = await Product.findByIdAndUpdate(id, body, { new: true }).lean();
  // Cleanup images removed from the product
  try {
    if (prev) {
      const prevUrls = new Set<string>([
        ...(Array.isArray(prev.images) ? prev.images : []),
        ...(typeof prev.imageUrl === "string" && prev.imageUrl ? [prev.imageUrl] : []),
      ]);
      const nextUrls = new Set<string>([
        ...(Array.isArray(body.images) ? body.images : []),
        ...((body.imageUrl && typeof body.imageUrl === "string") ? [body.imageUrl] : []),
      ].filter(Boolean));
      const removed: string[] = [];
      prevUrls.forEach((u) => { if (!nextUrls.has(u)) removed.push(u); });
      const ids = Array.from(new Set(removed
        .map((u) => getCloudinaryPublicIdFromUrl(u))
        .filter((x): x is string => typeof x === "string" && x.length > 0)
      ));
      if (ids.length) {
        await Promise.all(ids.map((pid) => cloudinary.uploader.destroy(pid).catch((e: unknown) => console.warn("Cloudinary delete (update) failed:", pid, e))));
      }
    }
  } catch (e) {
    console.warn("Cleanup on update failed:", e);
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  await connectToDatabase();
  const { id } = await params;
  // Fetch product to get image URLs
  const doc = (await Product.findById(id).lean()) as IProduct | null;
  if (doc) {
    try {
      const urls: string[] = [
        ...(Array.isArray(doc.images) ? doc.images : []),
        ...(typeof doc.imageUrl === "string" && doc.imageUrl ? [doc.imageUrl] : []),
      ];
      const ids = Array.from(new Set(urls
        .map((u) => getCloudinaryPublicIdFromUrl(u))
        .filter((x): x is string => typeof x === "string" && x.length > 0)
      ));
      if (ids.length) {
        await Promise.all(ids.map((pid) => cloudinary.uploader.destroy(pid).catch((e: unknown) => console.warn("Cloudinary delete (delete) failed:", pid, e))));
      }
    } catch (e) {
      console.warn("Cleanup on delete failed:", e);
    }
  }
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}



