import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optional: Show notification or keep item in wishlist
  };

  if (wishlistItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-amber-50/30 flex items-center justify-center px-4">
          <div className="text-center">
            <Heart className="w-24 h-24 text-amber-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-amber-900 mb-3">Your Wishlist is Empty</h2>
            <p className="text-amber-600 mb-8">Save your favorite products here!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-amber-300 to-orange-400 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-300 transition inline-flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-amber-50/30 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-amber-900">My Wishlist</h1>
              <p className="text-amber-600 mt-2">{wishlistItems.length} items saved</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-amber-700 hover:text-amber-900 font-medium flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl p-5 shadow-md hover:shadow-2xl transition border border-amber-100 hover:border-amber-300 relative"
              >
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition shadow-md"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>

                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition duration-700"
                  />
                </div>

                <h3 className="font-bold text-lg text-amber-900 mb-2">{product.name}</h3>

                <div className="flex items-baseline space-x-2 mb-4">
                  <span className="text-2xl font-bold text-amber-800">{product.price}</span>
                  <span className="text-sm line-through text-amber-400">{product.oldPrice}</span>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-gradient-to-r from-amber-300 to-orange-400 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-300 transition flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" strokeWidth={2} />
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WishlistPage;

