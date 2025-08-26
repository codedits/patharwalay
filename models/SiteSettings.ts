import mongoose, { Schema, Model } from "mongoose";

export interface ISiteSettings {
  heroImageUrl?: string;
  heroHeadline?: string;
  hero2ImageUrl?: string;
  hero2Headline?: string;
  hero2Tagline?: string;
  heroImagePublicId?: string;
  hero2ImagePublicId?: string;
  productsHeroImageUrl?: string;
  productsHeroHeadline?: string;
  productsHeroTagline?: string;
  productsHeroImagePublicId?: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    heroImageUrl: String,
    heroHeadline: String,
    hero2ImageUrl: String,
    hero2Headline: String,
    hero2Tagline: String,
  heroImagePublicId: String,
  hero2ImagePublicId: String,
  productsHeroImageUrl: String,
  productsHeroHeadline: String,
  productsHeroTagline: String,
  productsHeroImagePublicId: String,
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);



