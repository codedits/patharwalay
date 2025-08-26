import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";

export const dynamic = "force-dynamic";

function makeCookieHeader(keep: boolean) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  if (keep) {
    // 30 days
    return `admin_ok=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
  }
  // session cookie
  return `admin_ok=1; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

export async function GET(req: Request) {
  await connectToDatabase();
  const doc = await SiteSettings.findOne().lean() as unknown as Record<string, unknown> | null;
  const has = !!(doc && doc.admin_pass);
  // check cookie
  const cookies = req.headers.get("cookie") || "";
  const ok = has && /(?:^|; )admin_ok=1(?:;|$)/.test(cookies);
  return NextResponse.json({ protected: has, ok });
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  const attempt = typeof body?.password === "string" ? body.password : "";
  const keep = !!body?.keep;
  const doc = await SiteSettings.findOne().lean() as unknown as Record<string, unknown> | null;
  const real = doc?.admin_pass as string | undefined;
  const ok = typeof real === "string" && attempt === real;
  const res = NextResponse.json({ ok });
  // Only set a persistent cookie when the user opted to 'keep' the session.
  // If keep is false we won't set any cookie so the client-side auth will
  // be lost on refresh (desired: non-persistent session).
  if (ok && keep) {
    res.headers.set("Set-Cookie", makeCookieHeader(keep));
  }
  return res;
}

export async function DELETE() {
  // clear cookie
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const header = `admin_ok=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
  const res = NextResponse.json({ ok: true });
  res.headers.set("Set-Cookie", header);
  return res;
}
