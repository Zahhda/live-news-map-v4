import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },

  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },

  // Simple product fallback
  price: Number,
  offerPrice: Number,
  image: [String], // General images (for non-variant fallback)

  // Add these two fields explicitly
  perSqFtPrice: {
    type: Number,
    default: 0,  // You can use 0 or null depending on your preference
  },
  perPanelSqFt: {
    type: Number,
    default: 0,
  },

  // Advanced variable product support
  variants: [
    {
      name: String, // Variant name like "S-Line", "M-Line"
      colors: [
        {
          name: String, // e.g. "White", "Black"
          price: Number, // Optional override
          image: String, // Cloudinary URL for this color
        },
      ],
    },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

const Product =
  mongoose.models.product || mongoose.model("product", productSchema);

export default Product;
