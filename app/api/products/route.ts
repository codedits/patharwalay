import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

export async function GET() {
  await connectToDatabase();
  const items = await Product.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  // ensure slug exists; generate from title if missing
  if (!body.slug && body.title) {
    body.slug = String(body.title).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  // ensure images is an array of strings if provided
  if (body.images && !Array.isArray(body.images)) {
    body.images = [String(body.images)];
  }
  // cap images to 7 and dedupe
  if (Array.isArray(body.images)) {
    body.images = Array.from(new Set(body.images.filter(Boolean).map(String))).slice(0, 7);
  }

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

  const created = await Product.create(body);
  return NextResponse.json(created, { status: 201 });
}



