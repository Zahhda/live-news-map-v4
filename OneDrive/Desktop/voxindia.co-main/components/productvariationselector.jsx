"use client";
import React, { useState } from "react";

const productData = {
  variants: ["S-Line", "M-Line", "L-Line"],
  colors: ["#5A2E1B", "#DEC6A0", "#1D1D1D", "#FFFFFF", "#3A3A3A", "#999999", "#000000"], // Hex codes
};

const ProductVariantSelector = () => {
  const [selectedVariant, setSelectedVariant] = useState("S-Line");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Variant */}
      <div className="mb-4">
        <p className="mb-2 font-semibold">Variant: <span className="font-bold">{selectedVariant}</span></p>
        <div className="flex gap-3">
          {productData.variants.map(variant => (
            <button
              key={variant}
              onClick={() => setSelectedVariant(variant)}
              className={`px-4 py-2 border rounded ${selectedVariant === variant ? "bg-black text-white" : "bg-white text-black"}`}
            >
              {variant}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-4">
        <p className="mb-2 font-semibold">Color:</p>
        <div className="flex gap-3">
          {productData.colors.map(color => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? "border-black" : "border-gray-300"}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            ></button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-6">
        <p className="mb-2 font-semibold">Quantity:</p>
        <div className="flex items-center border rounded w-fit">
          <button className="px-3 py-1" onClick={() => setQuantity(prev => Math.max(prev - 1, 1))}>−</button>
          <span className="px-4">{quantity}</span>
          <button className="px-3 py-1" onClick={() => setQuantity(prev => prev + 1)}>+</button>
        </div>
      </div>

      {/* Add to Cart */}
      <button className="w-full bg-black text-white py-3 rounded font-medium">
        🛒 Add to Cart
      </button>
    </div>
  );
};

export default ProductVariantSelector;
