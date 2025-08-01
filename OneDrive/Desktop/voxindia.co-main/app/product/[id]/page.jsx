"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { ChevronDown, ChevronUp, Wrench, Truck, ShieldCheck } from "lucide-react";

const COLOR_HEX = {
  White: "#ffffff",
  Grey: "#808080",
  Anthracite: "#293133",
  Black: "#000000",
  Mocca: "#837060",
  Natural: "#E1C699",
  "Natural Black": "#1D1D1B",
  Chocolate: "#7B3F00",
};

const WhyChooseUs = () => {
  const items = [
    {
      icon: <Wrench className="w-8 h-8 mb-2 text-black group-hover:scale-110 transition-transform" />,
      label: "Free Installation",
    },
    {
      icon: <Truck className="w-8 h-8 mb-2 text-black group-hover:scale-110 transition-transform" />,
      label: "Free Shipping PAN India",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 mb-2 text-black group-hover:scale-110 transition-transform" />,
      label: "2 Years Warranty",
    },
  ];

  return (
    <div className="mt-10 border-t pt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Us</h2>
      <div className="flex flex-col md:flex-row items-center justify-around text-center gap-8">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center group">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const accordionData = [
  {
    id: 1,
    question: "What are VOX Linerio Slat Panels?",
    answer:
      "VOX Linerio Slat Panels are decorative wall panels designed to enhance interior spaces with depth, warmth, and sophistication. They come in three variants—S-Line, M-Line, and L-Line—each differing in the width and depth of the slats. These panels are made from polystyrene, a lightweight and durable material that is 100% recyclable."
  },
  {
    id: 2,
    question: "What are the differences between S-Line, M-Line, and L-Line panels?",
    answer:
      "S-Line: Features narrow slats, providing a subtle texture suitable for minimalist designs.\nM-Line: Offers medium-width slats, balancing subtlety and prominence.\nL-Line: Comprises wide slats, making a bold statement and adding significant depth to walls."
  },
  {
    id: 3,
    question: "In which colors are Linerio panels available?",
    answer:
      "Linerio panels are available in various shades, including Natural, Mocca, Chocolate, White, Grey, Black, and Anthracite."
  },
  {
    id: 4,
    question: "Can Linerio panels be installed in bathrooms or kitchens?",
    answer:
      "Yes, Linerio panels can be installed in damp areas like bathrooms and kitchens. However, they should not be exposed to direct contact with water or installed in areas with temperatures exceeding 60°C, such as saunas or near cookers."
  },
  {
    id: 5,
    question: "How are Linerio panels installed?",
    answer:
      "Linerio panels are designed for easy installation. They can be mounted using adhesive and cut to size using a saw or jigsaw. Installation can be done vertically, horizontally, or diagonally. Visit greatstack.voxindia.co for an installation guide or contact VOX technicians at +91 9528500500 for complex designs."
  },
  {
    id: 6,
    question: "Do Linerio panels improve room acoustics?",
    answer:
      "Yes, the spatial structure of Linerio panels helps to soundproof interiors by eliminating reverberation and echo, especially in larger rooms."
  },
  {
    id: 7,
    question: "Are Linerio panels environmentally friendly?",
    answer:
      "Absolutely. Linerio panels are made from polystyrene, which is 100% recyclable. This makes them an eco-friendly choice for interior wall cladding."
  },
  {
    id: 8,
    question: "What are the dimensions of a single Linerio panel?",
    answer:
      "Each Linerio panel measures 3050 mm in length. The width and thickness vary by type:\nS-Line: 122 mm wide, 12 mm thick\nM-Line: 122 mm wide, 12 mm thick\nL-Line: 122 mm wide, 21 mm thick"
  },
  {
    id: 9,
    question: "Can Linerio panels be used on ceilings?",
    answer:
      "Yes, Linerio panels are versatile and can be installed on both walls and ceilings, allowing for cohesive interior designs."
  },
  {
    id: 10,
    question: "How do I maintain and clean Linerio panels?",
    answer:
      "Linerio panels are easy to maintain. Use a mild detergent and a soft cloth for cleaning. Avoid strong detergents, bleaching agents, solvents, strong acids/bases, or abrasives."
  },
  {
    id: 11,
    question: "Are VOX Linerio Slat Panels suitable for Indian weather conditions?",
    answer:
      "Yes, the panels are made from high-quality polystyrene that is resistant to moisture, heat, and humidity—suitable for Indian climates. They can be used in interiors and semi-humid areas like covered balconies."
  },
  {
    id: 12,
    question: "What are the best rooms to install VOX Linerio Panels in a home?",
    answer:
      "Ideal for living rooms, bedrooms, hallways, offices, and feature walls. Their acoustic benefits suit home theaters and study areas, while moisture resistance makes them suitable for kitchens and covered balconies."
  },
  {
    id: 13,
    question: "Can I use VOX Linerio Panels for commercial interiors?",
    answer:
      "Absolutely. They're widely used in cafes, salons, office lobbies, and showrooms due to their modern look, durability, and easy maintenance."
  },
  {
    id: 14,
    question: "How do VOX Linerio Panels compare to traditional wooden wall panels?",
    answer:
      "VOX Linerio Panels are lightweight, moisture-resistant, and low-maintenance. Unlike wood, they don’t warp, crack, or fade, making them better for humid conditions."
  },
  {
    id: 15,
    question: "Are VOX Linerio Panels customizable in terms of color or finish?",
    answer:
      "VOX offers panels in finishes like Natural Oak, Mocca, Chocolate, White, Grey, and Anthracite. While slat sizes (S, M, L) are fixed, you can choose a finish to match your decor."
  },
  {
    id: 16,
    question: "What is the estimated delivery time for VOX Linerio Slat Panels?",
    answer:
      "Delivery typically takes 8 to 14 working days from order confirmation. Orders ship after 24 hours, and cancellation is not possible post that."
  },
  {
    id: 17,
    question: "What should I do if my VOX Linerio panels arrive damaged?",
    answer:
      "Contact us at +91 9528500500 within 48 hours of delivery. Email photos of the damage and packaging to customercare@voxindia.co with your order details."
  },
  {
    id: 18,
    question: "Is there a warranty on VOX Linerio Panels?",
    answer:
      "Yes, there is a 2-year manufacturer’s warranty against defects in material and workmanship."
  },
  {
    id: 19,
    question: "Are shipping charges included in the product price?",
    answer:
      "Yes, VOX India offers Free Shipping across India on all orders placed via voxindia.co."
  },
  {
    id: 20,
    question: "How will Installation of VOX Linerio Panels work after delivery? Are there extra Installation Charges?",
    answer:
      "VOX India provides Free Installation across India for all orders from voxindia.co. For complex installations, accessories like Linerio Trims (sold separately) may be required. Contact +91 9528500500 post-order for more info."
  }
];

const Accordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);

    if (index >= visibleCount - 3 && visibleCount < accordionData.length) {
      setVisibleCount(Math.min(visibleCount + 3, accordionData.length));
    }
  };

  const visibleData = accordionData.slice(0, visibleCount);

  return (
    <div className="max-w-full mt-10 space-y-4 px-4 md:px-8 lg:px-16">
      {visibleData.map((item, index) => (
        <div key={item.id} className="border-b border-gray-200 w-full">
          <button
            onClick={() => toggleAccordion(index)}
            className="flex justify-between w-full p-4 bg-gray-100 hover:bg-gray-200 text-left text-lg font-medium text-gray-800 transition-all"
            type="button"
          >
            {item.question}
            {activeIndex === index ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
          {activeIndex === index && (
            <div className="p-4 text-gray-600 bg-white whitespace-pre-line transition-all duration-300">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function ProductPage() {
  const { id } = useParams();
  const { products, addToCart } = useAppContext();

  const [productData, setProductData] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [buyMode, setBuyMode] = useState("panel");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const thumbnailsRef = useRef(null);

  useEffect(() => {
    if (products && products.length) {
      const product = products.find((p) => p._id === id);
      setProductData(product || null);
      const firstColorImage = product?.variants?.[0]?.colors?.[0]?.image;
      setMainImage(firstColorImage || product?.image?.[0] || "");
    }
  }, [id, products]);

  if (!productData) return <Loading />;

  const variants = productData.variants || [];
  const currentVariant = variants[selectedVariantIndex] || null;
  const currentColors = currentVariant?.colors || [];
  const currentColor = currentColors[selectedColorIndex] || null;

  const basePrice =
    Number(currentColor?.price) ||
    Number(productData.offerPrice) ||
    Number(productData.price) ||
    0;

  const displayPrice = buyMode === "box" ? basePrice * 6 : basePrice;

  const discountPercent =
    productData.price &&
    productData.offerPrice &&
    productData.price > productData.offerPrice
      ? Math.round(
          ((productData.price - productData.offerPrice) / productData.price) * 100
        )
      : 0;

  const variantColorImages = variants
    .flatMap((variant) => variant.colors)
    .map((color) => color.image)
    .filter(Boolean);

  const mainImages = productData.image || [];
  const combinedImages = Array.from(new Set([...mainImages, ...variantColorImages]));

  const selectVariant = (index) => {
    setSelectedVariantIndex(index);
    setSelectedColorIndex(0);
    setQuantity(1);
    const defaultColorImage = variants[index]?.colors?.[0]?.image;
    setMainImage(defaultColorImage || productData.image?.[0] || "");
  };

  const selectColor = (index) => {
    setSelectedColorIndex(index);
    setQuantity(1);
    const colorImage = currentColors[index]?.image;
    setMainImage(colorImage || productData.image?.[0] || "");

    // Smooth scroll thumbnail container horizontally only — no page jump
    if (thumbnailsRef.current) {
      const container = thumbnailsRef.current;
      const buttons = container.children;
      const button = buttons[index];
      if (button) {
        const buttonCenter = button.offsetLeft + button.offsetWidth / 2;
        const containerCenter = container.clientWidth / 2;
        const scrollTo = buttonCenter - containerCenter;
        container.scrollTo({ left: scrollTo, behavior: "smooth" });
      }
    }
  };

  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1));
  const incrementQty = () => setQuantity((q) => q + 1);

  const toggleLightbox = () => setIsLightboxOpen((v) => !v);

  const perSqFt = Number(productData.perSqFtPrice);
  const perPanel = Number(productData.perPanelSqFt);
  const totalPanelSqFt = perPanel * quantity;

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-2 pt-14 space-y-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Images */}
          <div>
            <div
              onClick={toggleLightbox}
              className="overflow-hidden rounded-lg bg-gray-50 relative w-full h-[450px] group cursor-pointer"
            >
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={productData.name}
                  fill
                  priority
                  className="object-contain bg-white group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 450px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image
                </div>
              )}
            </div>

            <div
              ref={thumbnailsRef}
              className="flex space-x-4 mt-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#9CA3AF #F3F4F6" }}
            >
              {combinedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-transform hover:scale-105 focus:outline-none ${
                    mainImage === img ? "border-orange-500" : "border-transparent"
                  }`}
                  type="button"
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx}`}
                    width={80}
                    height={80}
                    className="object-contain bg-white"
                    sizes="80px"
                    priority={mainImage === img}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-semibold">{productData.name}</h1>
            <p className="text-lg text-gray-500 mb-4">
              Color: {currentColor?.name ?? "N/A"}
            </p>

            {/* Price and Discounts */}
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-3xl font-semibold">₹{displayPrice.toFixed(2)}</span>
              <span className="bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold select-none">
                5% OFF
              </span>
              {discountPercent > 0 && (
                <>
                  <span className="line-through text-lg text-gray-500">
                    ₹{productData.price.toFixed(2)}
                  </span>
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Per sq.ft and per panel */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded shadow text-center flex flex-col items-center justify-center">
                <div className="text-xs text-gray-600 mb-1">Per sq.ft</div>
                <div className="font-semibold text-lg flex items-center gap-2">
                  ₹{!isNaN(perSqFt) ? perSqFt.toFixed(2) : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded shadow text-center flex flex-col items-center justify-center">
                <div className="text-xs text-gray-600 mb-1">Per panel</div>
                <div className="font-semibold text-lg flex items-center gap-2">
                  {!isNaN(perPanel) ? perPanel.toFixed(3) + " sq.ft" : "N/A sq.ft"}
                </div>
              </div>
            </div>

            {/* Select Mode */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm font-medium">Select Mode:</span>
              <button
                onClick={() => setBuyMode("panel")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  buyMode === "panel" ? "bg-black text-white" : "bg-gray-200 text-black"
                }`}
              >
                By Panel
              </button>
            </div>

            {/* Variants */}
            <div className="flex space-x-4 mb-6">
              {variants.map((variant, idx) => (
                <button
                  key={idx}
                  onClick={() => selectVariant(idx)}
                  className={`py-2 px-4 border rounded-md font-semibold ${
                    selectedVariantIndex === idx
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {variant.name}
                </button>
              ))}
            </div>

            {/* Colors */}
            <div className="flex space-x-4 mb-6 items-center">
              <span className="font-semibold mr-4">Color:</span>
              {currentColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => selectColor(idx)}
                  title={color.name}
                  className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center cursor-pointer ${
                    selectedColorIndex === idx ? "ring-2 ring-blue-600" : ""
                  }`}
                  style={{ backgroundColor: COLOR_HEX[color.name] || "#ccc" }}
                >
                  <div className="w-6 h-6 rounded-full" />
                </button>
              ))}
            </div>

            {/* Quantity and Per Panel SqFt Box */}
            <div className="flex items-center space-x-6 mb-8">
              {/* Quantity controls */}
              <div className="flex items-center space-x-4">
                <span className="font-semibold">Quantity:</span>
                <button
                  onClick={decrementQty}
                  className="w-8 h-8 border border-gray-400 rounded text-2xl flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-xl">{quantity}</span>
                <button
                  onClick={incrementQty}
                  className="w-8 h-8 border border-gray-400 rounded text-2xl flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Per Panel SqFt × Quantity */}
              <div className="bg-gray-50 rounded-md shadow px-4 py-2 w-36 text-center select-none">
  {/* <div className="text-xs text-gray-500 mb-1">Per panel</div> */}
  <div className="font-semibold text-lg text-gray-900">
    {totalPanelSqFt.toFixed(3)} sq.ft
  </div>
</div>

            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() =>
                addToCart(
                  productData._id,
                  quantity,
                  currentVariant?._id,
                  currentColor?.name
                )
              }
              className="w-full py-3.5 bg-black text-white rounded hover:bg-gray-900 transition"
            >
              <span className="inline-flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.97-1.58L23 6H6"></path>
                </svg>
                <span>Add to Cart</span>
              </span>
            </button>

            <WhyChooseUs />
          </div>
        </div>

        <Accordion />
      </div>

      {isLightboxOpen && (
        <div
          onClick={toggleLightbox}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 cursor-zoom-out"
          aria-modal="true"
          role="dialog"
        >
          <img
            src={mainImage}
            alt="Expanded product"
            className="max-w-full max-h-full rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={toggleLightbox}
            aria-label="Close"
            className="absolute top-5 right-5 text-white text-3xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>
      )}

      <Footer />
    </>
  );
}
