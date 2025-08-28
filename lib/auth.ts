import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

/**
 * Ensures that write operations are allowed only when admin protection is disabled
 * or the admin_ok cookie is present. Returns a NextResponse with 401 status when
 * unauthorized, otherwise returns null so the caller can proceed.
 */
export async function ensureAdmin(req: Request): Promise<NextResponse | null> {
  await connectToDatabase();
  const doc = (await SiteSettings.findOne().lean()) as unknown as { admin_pass?: string } | null;
  const protectedAdmin = !!doc?.admin_pass;
  if (!protectedAdmin) return null; // No password set → open instance

  const cookies = req.headers.get("cookie") || "";
  const ok = /(?:^|; )admin_ok=1(?:;|$)/.test(cookies);
  if (ok) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
