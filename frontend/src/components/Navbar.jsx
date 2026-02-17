import React, { useState } from "react";
import { ShoppingCart, Search, Heart, Droplet, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { getCartCount, getWishlistCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/cart");
    }
  };

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate("/wishlist");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-amber-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with emblem */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-linear-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
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
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search for pure oils, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 pl-14 pr-12 rounded-full border border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 outline-none transition bg-amber-50/50 text-amber-900 placeholder-amber-400"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-amber-500 group-focus-within:text-amber-700" />
              <button 
                type="submit"
                className="absolute right-2 top-2 bg-linear-to-r from-amber-300 to-orange-400 text-white px-5 py-1.5 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-amber-200 transition flex items-center"
              >
                Go
              </button>
            </form>
          </div>

          {/* Cart & Account */}
          <div className="flex items-center space-x-5">
            <button 
              onClick={handleWishlistClick}
              className="relative p-2 text-amber-700 hover:text-amber-900 transition"
            >
              <Heart className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs text-white flex items-center justify-center">
                {getWishlistCount()}
              </span>
            </button>
            <button 
              onClick={handleCartClick}
              className="flex items-center space-x-2 bg-linear-to-r from-amber-50 to-orange-50 px-5 py-2.5 rounded-full border border-amber-200 hover:border-amber-400 transition shadow-sm"
            >
              <ShoppingCart className="w-5 h-5 text-amber-700" />
              <span className="font-semibold text-amber-800">Cart</span>
              <span className="bg-amber-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center">
                {getCartCount()}
              </span>
            </button>
            
            {/* Authentication buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {isAdmin() ? (
                  <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-800 rounded-full hover:bg-slate-200 transition"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Admin Panel</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/user/profile')}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition cursor-pointer"
                  >
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-xs text-amber-600 font-medium">MY PROFILE</div>
                      <div className="font-semibold">{user?.name || 'User'}</div>
                    </div>
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 bg-linear-to-r from-amber-400 to-orange-400 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-amber-300 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
