import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
    // Enable image optimization for better performance
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  // Enable compression
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Compression handled by hosting platform; keep config minimal for Next 15
};

export default nextConfig;
