// Sample products removed. The app now reads products from MongoDB via the API or model.
// Keep the exports for compatibility; return empty arrays so no sample cards are shown when DB isn't configured.
import type { Product } from "@/components/ProductCard";

// No sample products - fallbacks are disabled by returning empty arrays.
export const featuredProducts: Product[] = [];

export const allProducts: Product[] = [];



