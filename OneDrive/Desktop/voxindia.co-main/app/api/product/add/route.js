import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      name,
      slug,
      description,
      category,
      price,
      offerPrice,
      perSqFtPrice,
      perPanelSqFt,
      imageUrls,
      variants
    } = body;

    // ⚠️ Static or dummy userId just to satisfy schema
    const userId = "admin"; // Replace with actual admin ID if needed

    const newProduct = await Product.create({
      userId,
      name,
      slug,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      perSqFtPrice: Number(perSqFtPrice),
      perPanelSqFt: Number(perPanelSqFt),
      image: imageUrls,
      variants,
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      slug: newProduct.slug,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to add product" },
      { status: 500 }
    );
  }
}
