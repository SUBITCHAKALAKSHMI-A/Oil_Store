import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import productService from "../services/productService";

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await productService.getFeaturedProducts();
      if (response.success) {
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(product);
    console.log(`Added ${product.name} to cart`);
  };

  const handleToggleWishlist = (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleWishlist(product);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return `http://localhost:5000${product.images[0]}`;
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  if (loading) {
    return (
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <p className="text-gray-600">No featured products available</p>
          </div>
        </div>
      </section>
    );
  }

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
              key={product._id}
              className="group bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-amber-200/50 hover:border-amber-400 relative transform hover:-translate-y-1"
            >
              <div className="relative mb-4 overflow-hidden rounded-2xl shadow-md">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="w-full h-56 object-cover group-hover:scale-110 transition duration-700"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <button 
                  className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isInWishlist(product._id) 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-white/90 hover:bg-white'
                  }`}
                  onClick={() => handleToggleWishlist(product)}
                >
                  <Heart 
                    className={`w-5 h-5 transition-all duration-300 ${isInWishlist(product._id) ? 'text-red-500' : 'text-gray-400'}`}
                    fill={isInWishlist(product._id) ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth={2} 
                  />
                </button>
              </div>
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" stroke="currentColor" strokeWidth={1.5} />
                  ))}
                </div>
                <span className="text-xs text-amber-700 font-semibold ml-2">
                  ({product.reviews || 0})
                </span>
              </div>
              <h3 className="text-lg font-bold text-amber-900 mb-2 line-clamp-2">
                {product.name}
              </h3>
              {product.badge && (
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full mb-3 shadow-sm">
                  {product.badge}
                </span>
              )}
              <div className="flex items-baseline mb-4">
                <span className="text-2xl font-bold text-orange-600">
                  ₹{product.price}
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ₹{product.oldPrice}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold py-3 px-6 rounded-full hover:from-amber-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

