import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
// cloudinary is only needed for PUT (image cleanup). Lazy-load it there
import { ensureAdmin } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "auto";

export async function GET() {
  await connectToDatabase();
  const doc = await SiteSettings.findOne().lean();
  const normalized = (() => {
    if (!doc) return {} as Record<string, unknown>;
    const anyDoc = doc as unknown as Record<string, unknown>;
    // map legacy key heroHeadLine -> heroHeadline
    if (anyDoc.heroHeadLine && !anyDoc.heroHeadline) {
      anyDoc.heroHeadline = anyDoc.heroHeadLine;
      delete anyDoc.heroHeadLine;
    }
  // ensure hero2 fields exist (fallbacks not required, just pass through)
  // Never expose admin_pass in the public settings response
  if (anyDoc.admin_pass) delete anyDoc.admin_pass;
  return anyDoc;
  })();
  return NextResponse.json(normalized, {
    headers: {
      // Allow CDN / proxy caching for a short period to reduce TTFB for
      // repeated public requests. Stale-while-revalidate lets the CDN
      // serve slightly stale content while revalidation happens in the
      // background.
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}

// Cloudinary is lazy-loaded in the PUT handler to avoid impacting GET

export async function PUT(req: Request) {
  const guard = await ensureAdmin(req);
  if (guard) return guard;
  await connectToDatabase();
  // Lazy-load cloudinary to avoid adding its startup cost to GET (public) requests
  const cloudinaryImport = await import("cloudinary");
  type CloudinaryV2 = typeof cloudinaryImport.v2;
  const cloudinary: CloudinaryV2 = (cloudinaryImport as unknown as { v2: CloudinaryV2 }).v2;
  cloudinary.config({ secure: true });
  const raw = await req.json().catch(() => null);
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const body = raw as Record<string, unknown>;
  // normalize incoming keys
  if (body && typeof body === "object") {
    if (body.heroHeadLine && !body.heroHeadline) {
      body.heroHeadline = body.heroHeadLine;
      delete body.heroHeadLine;
    }
    // Accept hero2 and publicId fields as-is.
  }
  // clamp string lengths to avoid accidental huge docs
  const clampStr = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : v);
  body.heroHeadline = clampStr(body.heroHeadline, 180);
  body.hero2Headline = clampStr(body.hero2Headline, 180);
  body.hero2Tagline = clampStr(body.hero2Tagline, 300);
  body.productsHeroHeadline = clampStr(body.productsHeroHeadline, 180);
  body.productsHeroTagline = clampStr(body.productsHeroTagline, 300);
  const prev = (await SiteSettings.findOne().lean()) as unknown as { heroImagePublicId?: string; hero2ImagePublicId?: string; productsHeroImagePublicId?: string } | null;
  const prevHero1 = prev?.heroImagePublicId;
  const prevHero2 = prev?.hero2ImagePublicId;
  const prevProductsHero = prev?.productsHeroImagePublicId;

  const doc = await SiteSettings.findOneAndUpdate({}, body, { upsert: true, new: true }).lean();

  // Best-effort cleanup of old images when publicId changes
  try {
    const newHero1 = (body as { heroImagePublicId?: string }).heroImagePublicId;
    if (newHero1 && prevHero1 && newHero1 !== prevHero1) {
      // ignore errors; just log
        await cloudinary.uploader.destroy(prevHero1).catch((e: unknown) => console.warn("Failed to delete old hero image:", e));
    } else if ((body as { heroImageUrl?: unknown }).heroImageUrl == null || (body as { heroImageUrl?: unknown }).heroImageUrl === "") {
      if (prevHero1) {
        await cloudinary.uploader.destroy(prevHero1).catch((e: unknown) => console.warn("Failed to delete cleared hero image:", e));
      }
    }
  } catch (e) {
    console.warn("Hero1 cleanup error:", e);
  }
  try {
    const newHero2 = (body as { hero2ImagePublicId?: string }).hero2ImagePublicId;
    if (newHero2 && prevHero2 && newHero2 !== prevHero2) {
        await cloudinary.uploader.destroy(prevHero2).catch((e: unknown) => console.warn("Failed to delete old hero2 image:", e));
    } else if ((body as { hero2ImageUrl?: unknown }).hero2ImageUrl == null || (body as { hero2ImageUrl?: unknown }).hero2ImageUrl === "") {
      if (prevHero2) {
        await cloudinary.uploader.destroy(prevHero2).catch((e: unknown) => console.warn("Failed to delete cleared hero2 image:", e));
      }
    }
  } catch (e) {
    console.warn("Hero2 cleanup error:", e);
  }
  try {
    const newPH = (body as { productsHeroImagePublicId?: string }).productsHeroImagePublicId;
    if (newPH && prevProductsHero && newPH !== prevProductsHero) {
        await cloudinary.uploader.destroy(prevProductsHero).catch((e: unknown) => console.warn("Failed to delete old products hero image:", e));
    } else if ((body as { productsHeroImageUrl?: unknown }).productsHeroImageUrl == null || (body as { productsHeroImageUrl?: unknown }).productsHeroImageUrl === "") {
      if (prevProductsHero) {
        await cloudinary.uploader.destroy(prevProductsHero).catch((e: unknown) => console.warn("Failed to delete cleared products hero image:", e));
      }
    }
  } catch (e) {
    console.warn("Products hero cleanup error:", e);
  }
  return NextResponse.json(doc);
}



