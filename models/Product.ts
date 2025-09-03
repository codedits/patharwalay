import mongoose, { Schema, Model } from "mongoose";

export interface IProduct {
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  images?: string[];
  category?: string;
  slug?: string;
  onSale?: boolean;
  inStock?: boolean;
  featured?: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
  imageUrl: String,
  images: [String],
    category: String,
  slug: { type: String, required: true },
    onSale: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes: unique slug for fast lookups and createdAt for efficient sorting/limit queries
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ createdAt: -1 });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);


