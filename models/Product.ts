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
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
  imageUrl: String,
  images: [String],
    category: String,
    slug: { type: String, required: true, unique: true },
    onSale: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);


