import React from "react";

const HeaderSlider = () => {
  return (
    <div
      className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] rounded-xl mt-6"
      style={{
        backgroundImage: "url('/banner1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily:
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 rounded-xl z-0" />

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 md:px-12 max-w-[1200px]">
        <div className="text-left text-white">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-snug sm:leading-tight">
            Transform Your Space
          </h1>
          <h5 className="text-sm sm:text-base md:text-lg font-medium mt-3 leading-relaxed max-w-md sm:max-w-lg">
            Premium slatted wall and ceiling panels for modern interiors. 100% recyclable, lightweight, and easy to install.
          </h5>
          <div className="mt-6 sm:mt-8">
            <button className="px-6 py-3 bg-[#e80808] hover:bg-red-800 rounded-md text-white text-base font-semibold transition">
              Explore Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSlider;
