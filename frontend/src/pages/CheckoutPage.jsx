import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { cartItems } = useCart();

  const incomingItems = location.state?.items;
  const [checkoutItems, setCheckoutItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (incomingItems && incomingItems.length > 0) {
      setCheckoutItems(incomingItems.map((item) => ({ ...item, quantity: item.quantity || 1 })));
      return;
    }

    if (cartItems.length > 0) {
      setCheckoutItems(cartItems.map((item) => ({ ...item, quantity: item.quantity || 1 })));
      return;
    }

    navigate('/cart');
  }, [isAuthenticated, navigate, incomingItems, cartItems]);

  const parsePrice = (price) => {
    if (typeof price === 'number') return price;
    return parseFloat(String(price || '0').replace('₹', '').replace(/,/g, '')) || 0;
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCheckoutItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)));
  };

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0),
    [checkoutItems]
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-amber-50/30 py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="text-amber-800 font-medium flex items-center mb-5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-amber-100">
              <h1 className="text-3xl font-bold text-amber-900 mb-6">Checkout Details</h1>

              <h2 className="text-lg font-semibold text-amber-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  className="border border-amber-200 rounded-lg px-4 py-3"
                  placeholder="Full Name"
                  defaultValue={user?.name || ''}
                />
                <input className="border border-amber-200 rounded-lg px-4 py-3" placeholder="Phone Number" />
              </div>
              <input
                className="w-full border border-amber-200 rounded-lg px-4 py-3 mb-6"
                placeholder="Email Address"
                defaultValue={user?.email || ''}
              />

              <h2 className="text-lg font-semibold text-amber-900 mb-3">Delivery Address</h2>
              <textarea
                className="w-full border border-amber-200 rounded-lg px-4 py-3 min-h-28 mb-6"
                placeholder="Enter your complete delivery address"
              />

              <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-bold transition">
                Pay Now - ₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </button>
            </div>

            <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-amber-100 h-fit sticky top-24">
              <h2 className="text-2xl font-bold text-amber-900 mb-4">Order Summary</h2>

              <div className="space-y-4 mb-4 max-h-80 overflow-auto pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="border border-amber-100 rounded-xl p-3">
                    <div className="flex items-start gap-3">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold text-amber-900 line-clamp-2">{item.name}</p>
                        <p className="text-sm text-amber-700">₹{parsePrice(item.price).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-amber-700">Quantity</span>
                      <div className="flex items-center border border-amber-200 rounded-lg">
                        <button
                          onClick={() => updateQty(item.id, item.quantity - 1)}
                          className="p-2 bg-amber-700 hover:bg-amber-800 transition"
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <span className="px-3 py-1 font-semibold text-amber-900 min-w-10 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.quantity + 1)}
                          className="p-2 bg-amber-700 hover:bg-amber-800 transition"
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-amber-100 pt-4 space-y-2 text-amber-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5%)</span>
                  <span className="font-semibold">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-pink-500 pt-1">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-amber-600 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Secure payment enabled
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
