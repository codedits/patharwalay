/**
 * Utility functions for optimized image loading
 */

// Generate a simple blur placeholder
export function createBlurDataURL(width: number = 10, height: number = 10): string {
  // Create a simple gradient blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1f2937;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#374151;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `.replace(/\s+/g, ' ').trim();
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Optimized sizes for different image types
export const imageSizes = {
  // Full-bleed hero/showcase images
  fullBleed: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw",
  // Split layout images (half width on large screens)
  split: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 50vw",
  // Card/thumbnail images
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  // Product detail images
  product: "(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw"
} as const;

// Optimized image props for different scenarios
export const imageProps = {
  // Critical images (above fold)
  critical: {
    priority: true,
    placeholder: "blur" as const,
    decoding: "sync" as const,
  },
  // Below fold images
  lazy: {
    loading: "lazy" as const,
    placeholder: "blur" as const,
    decoding: "async" as const,
  },
  // Background/decorative images
  background: {
    loading: "lazy" as const,
    decoding: "async" as const,
    placeholder: "blur" as const,
  }
} as const;