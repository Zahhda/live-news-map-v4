import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    id: 1,
    title: "S-Line",
    subtitle: "Narrow lamellas for a taller, cozier space",
    colors: ["White", "Grey", "Anthracite", "Black", "Mocca", "Natural", "Natural Black"],
    image: "/collections/s-line.png",
    link: "/product/688540e1fdbb8814f789a1df", // S-Line link
  },
  {
    id: 2,
    title: "M-Line",
    subtitle: "Medium-width lamellas with extra depth",
    colors: ["White", "Grey", "Anthracite", "Black", "Mocca", "Natural", "Natural Black", "Chocolate"],
    image: "/collections/m-line.png",
    link: "/product/6885b1eddf36d2068fa78826", // M-Line link added
  },
  {
    id: 3,
    title: "L-Line",
    subtitle: "Wide lamellas for bold visual impact",
    colors: ["White", "Grey", "Anthracite", "Mocca", "Natural", "Chocolate"],
    image: "/collections/l-line.png",
    link: "/product/68854558fdbb8814f789aaa4", // L-Line link added
  },
];

const OurCollections = () => {
  return (
    <div
      className="mt-16 px-4 md:px-12"
      style={{
        fontFamily:
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center text-gray-900">
        Our Collections
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map(({ id, title, subtitle, colors, image, link }) => (
          <div
            key={id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col"
          >
            <div className="h-64 w-full relative">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>

            <div className="flex flex-col justify-between flex-1 p-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                  {subtitle}
                </p>
                <p className="font-semibold text-gray-800 mb-3 text-sm tracking-tight">
                  Available Colors:
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-sm text-gray-700 px-3 py-1 rounded-full select-none"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              {link ? (
                <Link href={link} passHref>
                  <button className="mt-auto w-full py-2.5 bg-red-600 hover:bg-[#e80808] transition text-white rounded text-sm font-semibold">
                    View Collection
                  </button>
                </Link>
              ) : (
                <button className="mt-auto w-full py-2.5 bg-gray-300 text-gray-600 rounded text-sm font-semibold cursor-not-allowed">
                  Coming Soon
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurCollections;
