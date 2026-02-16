import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import coconutImage from '../assets/coconut.jpg';
import oliveImage from '../assets/olive.jpg';
import groundnutImage from '../assets/groundnut.jpg';
import sesameImage from '../assets/sesame.jpg';
import sunflowerImage from '../assets/sunflower.jpg';
import walnutImage from '../assets/walnut.jpg';
import almondImage from '../assets/almond.jpg';
import castorImage from '../assets/castor.jpg';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const searchQuery = searchParams.get('q') || '';
  const [filteredProducts, setFilteredProducts] = useState([]);

  const allProducts = [
    { id: 1, name: "Extra Virgin Olive Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.8, reviews: 124, badge: "Bestseller", image: oliveImage },
    { id: 2, name: "Cold Pressed Coconut Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.7, reviews: 98, badge: "Organic", image: coconutImage },
    { id: 3, name: "Wood Pressed Groundnut Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.6, reviews: 87, badge: "Traditional", image: groundnutImage },
    { id: 4, name: "Pure Sesame Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.8, reviews: 76, badge: "Gingelly", image: sesameImage },
    { id: 5, name: "Refined Sunflower Oil", price: "₹1,274", oldPrice: "₹1,400", rating: 4.5, reviews: 112, badge: "Light", image: sunflowerImage },
    { id: 6, name: "Premium Walnut Oil", price: "₹2,274", oldPrice: "₹2,675", rating: 4.9, reviews: 45, badge: "Gourmet", image: walnutImage },
    { id: 7, name: "Sweet Almond Oil", price: "₹2,275", oldPrice: "₹2,675", rating: 4.7, reviews: 63, badge: "Vitamin E", image: almondImage },
    { id: 8, name: "Traditional Castor Oil", price: "₹1,275", oldPrice: "₹1,675", rating: 4.6, reviews: 93, badge: "Wood Pressed", image: castorImage }
  ];

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.badge.toLowerCase().includes(query)
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts(allProducts);
    }
  }, [searchQuery]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    addToCart(product);
  };

  const handleToggleWishlist = (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggleWishlist(product);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-amber-50/30 py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-amber-900 mb-2">
                Search Results {searchQuery && `for "${searchQuery}"`}
              </h1>
              <p className="text-amber-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-amber-700 hover:text-amber-900 font-medium flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>

          {/* Results */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <SearchIcon className="w-24 h-24 text-amber-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-amber-900 mb-3">No products found</h2>
              <p className="text-amber-600 mb-8">Try searching with different keywords</p>
              <button
                onClick={() => navigate('/')}
                className="bg-linear-to-r from-amber-300 to-orange-400 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-300 transition"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-linear-to-b from-white to-amber-50/30 rounded-3xl p-5 shadow-md hover:shadow-2xl transition border border-amber-100 hover:border-amber-300 relative"
                >
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition duration-700"
                    />
                    <button 
                      className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                        isInWishlist(product.id) 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-white/90 hover:bg-white'
                      }`}
                      onClick={() => handleToggleWishlist(product)}
                    >
                      <Heart 
                        className={`w-5 h-5 transition-all duration-300 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}
                        fill={isInWishlist(product.id) ? "currentColor" : "none"} 
                        stroke="currentColor" 
                        strokeWidth={2} 
                      />
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
                    className="w-full bg-linear-to-r from-amber-300 to-orange-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-300 transition flex items-center justify-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" strokeWidth={2} /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchPage;
