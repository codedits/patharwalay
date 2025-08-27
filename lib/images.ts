export function polishImageUrl(src?: string | null, extraTransforms: string[] = []): string {
  if (!src || typeof src !== "string") return "";
  try {
    const u = new URL(src);
    if (!u.hostname.includes("res.cloudinary.com")) return src;
    const marker = "/upload/";
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return src;
    const before = u.pathname.slice(0, idx + marker.length);
    const after = u.pathname.slice(idx + marker.length); // may include version and/or existing transforms
    // Build transform string: always include format/quality, optionally more
    const base = ["f_auto", "q_auto"];
    const transforms = Array.from(new Set([...base, ...extraTransforms])).join(",");
    // Insert our transforms before the rest (version or existing transforms)
    u.pathname = `${before}${transforms}/${after}`;
    return u.toString();
  } catch {
    return src;
  }
}

// Lightweight server-side LQIP: shimmer SVG encoded as base64 data URL.
// Avoids remote fetches while providing a pleasant blurred placeholder.
function toBase64(str: string) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64");
  }
  // Fallback for non-Node environments
  return (globalThis as unknown as { btoa?: (s: string) => string }).btoa?.(str) ?? "";
}

export function shimmerSVG(w: number, h: number, color = { bg: "#f6f7f8", highlight: "#edeef1" }) {
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g">
        <stop stop-color="${color.bg}" offset="20%" />
        <stop stop-color="${color.highlight}" offset="50%" />
        <stop stop-color="${color.bg}" offset="70%" />
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="${color.bg}" />
    <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
    <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
  </svg>`;
}

export function shimmerDataURL(w: number, h: number) {
  return `data:image/svg+xml;base64,${toBase64(shimmerSVG(w, h))}`;
}
