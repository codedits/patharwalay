// Utility script to update existing products with categories
// Run this once to categorize your existing products

import { connectToDatabase } from "../lib/db.js";
import { Product } from "../models/Product.js";

async function updateProductCategories() {
  try {
    await connectToDatabase();
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to categorize`);
    
    for (const product of products) {
      let category = "";
      const title = product.title.toLowerCase();
      
      // Auto-categorize based on title keywords
      if (title.includes("ring")) {
        category = "ring";
      } else if (title.includes("bracelet") || title.includes("bangle")) {
        category = "bracelet";
      } else if (title.includes("gem") || title.includes("stone") || title.includes("ruby") || 
                 title.includes("emerald") || title.includes("sapphire") || title.includes("diamond") ||
                 title.includes("topaz") || title.includes("amethyst") || title.includes("opal")) {
        category = "gemstone";
      }
      
      if (category && (!product.category || product.category.trim() === "")) {
        await Product.updateOne({ _id: product._id }, { category });
        console.log(`Updated "${product.title}" with category: ${category}`);
      }
    }
    
    console.log("Category update completed!");
  } catch (error) {
    console.error("Error updating categories:", error);
  }
}

// Uncomment the line below and run: node scripts/update-categories.js
// updateProductCategories();

export { updateProductCategories };