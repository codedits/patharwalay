export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type SanitizedProduct = {
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category?: string;
  onSale?: boolean;
  inStock?: boolean;
  featured?: boolean;
  slug?: string;
};

export function sanitizeProductInput(body: unknown): { ok: true; value: SanitizedProduct } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" };
  const src = body as Record<string, unknown>;
  const title = typeof src.title === "string" ? src.title.trim() : "";
  if (!title) return { ok: false, error: "Title is required" };
  if (title.length > 160) return { ok: false, error: "Title too long" };

  const description = typeof src.description === "string" ? src.description.trim().slice(0, 5000) : undefined;

  let price: number = 0;
  if (typeof src.price === "number" && Number.isFinite(src.price)) price = Math.max(0, Math.floor(src.price));
  else if (typeof src.price === "string") {
    const parsed = parseInt(src.price.replace(/[^0-9]/g, ""), 10);
    price = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }

  const onSale = !!src.onSale;
  const inStock = src.inStock == null ? true : !!src.inStock;
  const featured = !!src.featured;

  const category = (() => {
    if (typeof src.category !== "string") return undefined;
    const c = src.category.trim().toLowerCase();
    if (!c) return "";
    if (["gem", "gems", "gemstone", "gemstones"].includes(c)) return "gemstone";
    if (["ring", "rings"].includes(c)) return "ring";
    if (["bracelet", "bracelets", "bangle", "bangles"].includes(c)) return "bracelet";
    if (["uncategorized", "none", "empty", "null"].includes(c)) return "";
    return c; // allow custom categories as-is
  })();

  let imageUrl = typeof src.imageUrl === "string" ? src.imageUrl.trim() : undefined;

  let images: string[] | undefined = undefined;
  if (Array.isArray(src.images)) {
    images = Array.from(new Set(src.images.filter((u) => typeof u === "string" && u).map((u) => (u as string).trim()))).slice(0, 7);
  } else if (typeof src.images === "string") {
    images = [src.images.trim()];
  }
  if (!imageUrl && images && images.length) imageUrl = images[0];

  let slug = typeof src.slug === "string" ? src.slug.trim() : undefined;
  if (!slug && title) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  return { ok: true, value: { title, description, price, imageUrl, images, category, onSale, inStock, featured, slug } };
}
