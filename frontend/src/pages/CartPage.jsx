import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price.replace('₹', '').replace(',', '')).toFixed(2);
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-amber-50/30 flex items-center justify-center px-4">
          <div className="text-center">
            <ShoppingBag className="w-24 h-24 text-amber-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-amber-900 mb-3">Your Cart is Empty</h2>
            <p className="text-amber-600 mb-8">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="bg-linear-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-amber-300 transition inline-flex items-center"
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
              <h1 className="text-4xl font-bold text-amber-900">Shopping Cart</h1>
              <p className="text-amber-600 mt-2">{cartItems.length} items in your cart</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-amber-700 hover:text-amber-900 font-medium flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition flex items-center gap-6"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-amber-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-amber-600 mb-3">{item.badge}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-amber-800">{item.price}</span>
                        <span className="text-sm line-through text-amber-400">{item.oldPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center border-2 border-amber-200 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-amber-50 transition"
                      >
                        <Minus className="w-4 h-4 text-amber-700" />
                      </button>
                      <span className="px-4 py-2 font-semibold text-amber-900 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-amber-50 transition"
                      >
                        <Plus className="w-4 h-4 text-amber-700" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 transition flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-amber-600 mb-1">Subtotal</p>
                    <p className="text-xl font-bold text-amber-900">
                      ₹{(parseFloat(item.price.replace('₹', '').replace(',', '')) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={clearCart}
                className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition"
              >
                Clear All Items
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-md sticky top-24">
                <h2 className="text-2xl font-bold text-amber-900 mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-amber-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{getCartTotal().toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span>Tax (Estimated)</span>
                    <span className="font-semibold">₹{(getCartTotal() * 0.05).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="border-t-2 border-amber-100 pt-3">
                    <div className="flex justify-between text-lg font-bold text-amber-900">
                      <span>Total</span>
                      <span>₹{(getCartTotal() * 1.05).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-linear-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-amber-300 transition mb-3">
                  Proceed to Checkout
                </button>

                <div className="space-y-2 text-sm text-amber-600">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Free shipping on orders above ₹500</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>100% Authentic Products</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Easy Returns & Refunds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
