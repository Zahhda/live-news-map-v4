import React from "react";

const Banner = () => {
  return (
    <section
      className="max-w-7xl mx-auto px-6 md:px-16 lg:px-2 py-16"
      style={{
        fontFamily:
          "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Feature Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          {
            title: "Eco-Friendly",
            desc: "Made from 100% recyclable polystyrene with hot-stamp finish.",
          },
          {
            title: "Easy Installation",
            desc: "Quick and easy glue-on installation with matching mounting strips.",
          },
          {
            title: "Sound Absorbing",
            desc: "Improve your room's acoustics with our sound-absorbing panels.",
          },
        ].map(({ title, desc }, idx) => (
          <div key={idx} className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-2 text-gray-900">{title}</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Customer Testimonials */}
      <div>
        <h2 className="text-2xl font-semibold mb-8 text-gray-900">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              quote:
                "The Linerio panels transformed our living room. Easy to install and the quality is outstanding.",
              author: "Sarah J.",
            },
            {
              quote:
                "Perfect solution for our office space. The acoustic properties make a noticeable difference.",
              author: "Michael T., Interior Designer",
            },
          ].map(({ quote, author }, idx) => (
            <blockquote
              key={idx}
              className="bg-gray-100 p-6 rounded-lg text-gray-800 leading-relaxed not-italic"
            >
              “{quote}”
              <footer className="mt-4 font-semibold">{`- ${author}`}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;
