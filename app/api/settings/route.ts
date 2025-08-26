import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import cloudinaryImport from "cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CloudinaryV2 = typeof cloudinaryImport.v2;
const cloudinary: CloudinaryV2 = (cloudinaryImport as unknown as { v2: CloudinaryV2 }).v2;
cloudinary.config({ secure: true });

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
    return anyDoc;
  })();
  return NextResponse.json(normalized);
}

export async function PUT(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  // normalize incoming keys
  if (body && typeof body === "object") {
    if (body.heroHeadLine && !body.heroHeadline) {
      body.heroHeadline = body.heroHeadLine;
      delete body.heroHeadLine;
    }
    // Accept hero2 and publicId fields as-is.
  }
  const prev = (await SiteSettings.findOne().lean()) as unknown as { heroImagePublicId?: string; hero2ImagePublicId?: string } | null;
  const prevHero1 = prev?.heroImagePublicId;
  const prevHero2 = prev?.hero2ImagePublicId;

  const doc = await SiteSettings.findOneAndUpdate({}, body, { upsert: true, new: true }).lean();

  // Best-effort cleanup of old images when publicId changes
  try {
    const newHero1 = (body as { heroImagePublicId?: string }).heroImagePublicId;
    if (newHero1 && prevHero1 && newHero1 !== prevHero1) {
      // ignore errors; just log
  await cloudinary.uploader.destroy(prevHero1).catch((e: unknown) => console.warn("Failed to delete old hero image:", e));
    }
  } catch (e) {
    console.warn("Hero1 cleanup error:", e);
  }
  try {
    const newHero2 = (body as { hero2ImagePublicId?: string }).hero2ImagePublicId;
    if (newHero2 && prevHero2 && newHero2 !== prevHero2) {
  await cloudinary.uploader.destroy(prevHero2).catch((e: unknown) => console.warn("Failed to delete old hero2 image:", e));
    }
  } catch (e) {
    console.warn("Hero2 cleanup error:", e);
  }
  return NextResponse.json(doc);
}



