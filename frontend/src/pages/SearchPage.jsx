import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowLeft, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import productService from '../services/productService';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const searchQuery = searchParams.get('q') || '';

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let response;
      if (searchQuery.trim()) {
        response = await productService.searchProducts(searchQuery);
      } else {
        response = await productService.getAllProducts();
      }
      if (response.success) {
        setFilteredProducts(response.products || []);
      }
    } catch (err) {
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return `http://localhost:5000${product.images[0]}`;
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const handleToggleWishlist = (e, product) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
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
                {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
              </h1>
              <p className="text-amber-600">
                {loading ? 'Searching...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`}
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
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredProducts.length === 0 ? (
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
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="group bg-linear-to-b from-white to-amber-50/30 rounded-3xl p-5 shadow-md hover:shadow-2xl transition border border-amber-100 hover:border-amber-300 relative cursor-pointer"
                >
                  <div className="relative mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition duration-700"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                    <button
                      className="absolute top-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md ring-1 ring-black/5 transition-all duration-300 hover:scale-105 hover:bg-white"
                      onClick={(e) => handleToggleWishlist(e, product)}
                      aria-label={isInWishlist(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${isInWishlist(product._id) ? 'text-pink-500' : 'text-slate-500'}`}
                        fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                      />
                    </button>
                    {product.badge && (
                      <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-amber-600 ml-2">({product.reviews || 0})</span>
                  </div>
                  <h3 className="font-bold text-lg text-amber-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className="text-2xl font-bold text-amber-800">
                      ₹{product.price?.toLocaleString('en-IN')}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm line-through text-amber-400">
                        ₹{product.oldPrice?.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={!product.inStock}
                    className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center ${
                      product.inStock
                        ? 'bg-linear-to-r from-amber-300 to-orange-400 text-white hover:shadow-lg hover:shadow-amber-300'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" strokeWidth={2} />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
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

