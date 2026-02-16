import React, { useState } from "react";
import { ShoppingCart, Heart, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import coconutImage from "../assets/coconut.jpg";
import oliveImage from "../assets/olive.jpg";
import groundnutImage from "../assets/groundnut.jpg";
import sesameImage from "../assets/sesame.jpg";
import sunflowerImage from "../assets/sunflower.jpg";
import walnutImage from "../assets/walnut.jpg";
import almondImage from "../assets/almond.jpg";
import castorImage from "../assets/castor.jpg";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(product);
    // Optional: Show a toast notification
    console.log(`Added ${product.name} to cart`);
  };

  const handleToggleWishlist = (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleWishlist(product);
  };

  const products = [
    { id: 1, name: "Extra Virgin Olive Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.8, reviews: 124, badge: "Bestseller", image: oliveImage },
    { id: 2, name: "Cold Pressed Coconut Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.7, reviews: 98, badge: "Organic", image: coconutImage },
    { id: 3, name: "Wood Pressed Groundnut Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.6, reviews: 87, badge: "Traditional", image: groundnutImage },
    { id: 4, name: "Pure Sesame Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.8, reviews: 76, badge: "Gingelly", image: sesameImage },
    { id: 5, name: "Refined Sunflower Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.5, reviews: 112, badge: "Light", image: sunflowerImage },
    { id: 6, name: "Premium Walnut Oil", price: "₹2,274", oldPrice: "₹2,675", rating: 4.9, reviews: 45, badge: "Gourmet", image: walnutImage },
    { id: 7, name: "Sweet Almond Oil", price:" ₹2,275 ", oldPrice:" ₹2,675 ", rating : 4.7 , reviews : 63 , badge : "Vitamin E" , image : almondImage },
    { id : 8 , name : 'Traditional Castor Oil' , price : '₹1,275' , oldPrice : '₹1,675' , rating : 4.6 , reviews : 93 , badge : 'Wood Pressed' , image : castorImage }
];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-amber-600 font-semibold uppercase text-sm">
              Premium selection
            </span>
            <h2 className="text-4xl font-bold text-amber-900 mt-2">
              Best Selling Oils
            </h2>
          </div>
          <button className="text-amber-700 font-medium flex items-center hover:text-amber-900">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-linear-to-b from-white to-amber-50/30 rounded-3xl p-5 shadow-md hover:shadow-2xl transition border border-amber-100 hover:border-amber-300 relative"
            >
              <div className="absolute top-4 left-4 z-10 bg-linear-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                {product.badge}
              </div>
              <div className="relative mb-4 overflow-hidden rounded-2xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition duration-700"
                />
                <button className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition shadow-md" onClick={() => handleToggleWishlist(product)}>
                  <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke={isInWishlist(product.id) ? "#ef4444" : "#dc2626"} strokeWidth={2} color={isInWishlist(product.id) ? "#ef4444" : "#dc2626"} />
                </button>
              </div>
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" stroke="currentColor" strokeWidth={1.5} />
                  ))}
                </div>
                <span className="text-xs text-amber-600 ml-2">
                  ({product.reviews})
                </span>
              </div>
              <h3 className="font-bold text-lg text-amber-900 mb-1">
                {product.name}
              </h3>
              <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-2xl font-bold text-amber-800">
                  {product.price}
                </span>
                <span className="text-sm line-through text-amber-400">
                  {product.oldPrice}
                </span>
              </div>
              <button 
                onClick={() => handleAddToCart(product)}
                className="w-full bg-linear-to-r from-amber-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-300 transition flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" strokeWidth={2} /> Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;