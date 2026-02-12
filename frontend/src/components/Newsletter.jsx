import React from "react";
import { Droplet } from "lucide-react";
import almondImage from "../assets/almond.jpg";

const Newsletter = () => {
  return (
    <section className="bg-linear-to-r from-amber-900 to-orange-900 text-white py-20 relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            `url("${almondImage}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.1,
        }}
      ></div>
      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-amber-500/30 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Droplet className="w-10 h-10 text-amber-200" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Sip the Golden Goodness</h2>
          <p className="text-amber-200 mb-8 text-lg">
            Subscribe for exclusive offers, healthy recipes, and new arrivals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-6 py-4 rounded-full border-0 text-amber-900 placeholder-amber-400 focus:ring-4 focus:ring-amber-500 outline-none bg-white/90 backdrop-blur"
            />
            <button className="bg-linear-to-r from-amber-400 to-orange-400 text-amber-900 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;