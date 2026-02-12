import React from "react";
import { ShoppingCart, Search, Heart, Droplet } from "lucide-react";

const Navbar = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-amber-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with emblem */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
                <Droplet className="w-7 h-7 text-white" fill="white" stroke="white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                OIL
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-amber-800 to-orange-700 bg-clip-text text-transparent">
                Golden<span className="text-amber-600">Drops</span>
              </h1>
              <p className="text-xs text-amber-600 font-medium tracking-wider">
                PURE • NATURAL • PREMIUM
              </p>
            </div>
          </div>

          {/* Search bar - attractive */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search for pure oils, brands..."
                className="w-full px-6 py-3 pl-14 pr-12 rounded-full border border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition bg-amber-50/50 text-amber-900 placeholder-amber-400"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-amber-500 group-focus-within:text-amber-700" />
              <button className="absolute right-2 top-2 bg-linear-to-r from-amber-500 to-orange-500 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-amber-200 transition flex items-center">
                Go
              </button>
            </div>
          </div>

          {/* Cart & Account */}
          <div className="flex items-center space-x-5">
            <button className="relative p-2 text-amber-700 hover:text-amber-900 transition">
              <Heart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center">
                0
              </span>
            </button>
            <button className="flex items-center space-x-2 bg-linear-to-r from-amber-50 to-orange-50 px-5 py-2.5 rounded-full border border-amber-200 hover:border-amber-400 transition shadow-sm">
              <ShoppingCart className="w-5 h-5 text-amber-700" />
              <span className="font-semibold text-amber-800">Cart</span>
              <span className="bg-amber-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <button className="w-10 h-10 bg-linear-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-amber-300">
              A
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;