import { NextResponse } from "next/server";
import cloudinaryImport from "cloudinary";
import { ensureAdmin } from "@/lib/auth";

// Ensure this route runs in Node.js (not Edge) so Buffer and Cloudinary SDK work reliably
export const runtime = "nodejs";
// Don't cache this route; uploads are inherently dynamic
export const dynamic = "force-dynamic";
// Allow a bit more time for large uploads on some platforms
export const maxDuration = 60;

// Minimal Cloudinary typings to avoid `any` while staying compatible with installed types
type CloudinaryUploadResult = { secure_url?: string; secureUrl?: string; url?: string } & Record<string, unknown>;
type CloudinaryV2 = {
  config: (cfg: { secure?: boolean } & Record<string, unknown>) => void;
  uploader: {
    upload_stream: (
      opts: { resource_type?: string; folder?: string } & Record<string, unknown>,
      cb: (error: unknown, result: CloudinaryUploadResult | undefined) => void
    ) => NodeJS.WritableStream;
  };
};
const cloudinary = (cloudinaryImport as unknown as { v2: CloudinaryV2 }).v2;

// Cloudinary Node SDK automatically reads CLOUDINARY_URL from env.
// We only enforce secure URLs here. Avoid passing an unsupported key like `cloudinary_url`.
cloudinary.config({ secure: true });

export async function POST(req: Request) {
  const guard = await ensureAdmin(req);
  if (guard) return guard;
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    // If client (or an intermediate proxy) provides Content-Length we can
    // proactively reject very large uploads with a JSON response. Some
    // platforms return a plain-text "Request Entity Too Large" before the
    // route runs; this check helps when the header is present.
    const contentLength = req.headers.get("content-length");
    const MAX_BYTES = 5 * 1024 * 1024; // 5 MiB
    if (contentLength) {
      const len = Number(contentLength);
      if (!Number.isNaN(len) && len > MAX_BYTES) {
        return NextResponse.json({ error: `File too large. Max allowed ${Math.round(MAX_BYTES / 1024 / 1024)} MB` }, { status: 413 });
      }
    }

  const formData = await req.formData();
  const file = formData.get("file");
  // Avoid relying on global File in Node; check for arrayBuffer function instead
  type BlobLike = { arrayBuffer: () => Promise<ArrayBuffer>; name?: string; type?: string };
  const blob = file as BlobLike | null;
  if (!blob || typeof blob.arrayBuffer !== "function") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // collect some info for debugging
  const fileName = blob.name as string | undefined;
  const fileType = blob.type as string | undefined;
  if (fileType && !/^image\//.test(fileType)) {
    return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
  }
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`/api/upload received file: name=${fileName} type=${fileType} size=${buffer.length}`);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      try {
  const stream = cloudinary.uploader.upload_stream({ resource_type: "image", folder: "products" }, (error, res) => {
          if (error || !res) return reject(error || new Error("Upload failed"));
          resolve(res);
        });
        stream.end(buffer);
      } catch (streamErr) {
        return reject(streamErr);
      }
    });

    console.log("/api/upload cloudinary result:", result);

    if (!result) {
      return NextResponse.json({ error: "Upload failed, no result returned" }, { status: 500 });
    }

    // prefer secure_url but include whole result for debugging
  const secure = result.secure_url || (result as { secureUrl?: string }).secureUrl || result.url || "";
  return NextResponse.json({ ok: true, secure_url: secure, raw: result });
  } catch (err) {
    // log to server console to aid debugging
    console.error("/api/upload error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
