import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, CreditCard } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import paymentService from '../services/paymentService';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, clearCart } = useCart();

  const incomingItems = location.state?.items;
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isPaying, setIsPaying] = useState(false);

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

  useEffect(() => {
    setFullName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-sdk')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (checkoutItems.length === 0) {
      alert('Your cart is empty. Please add products before checkout.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !email.trim() || !address.trim()) {
      alert('Please fill in your name, phone, email, and delivery address.');
      return;
    }

    try {
      setIsPaying(true);
      const ok = await loadRazorpayScript();
      if (!ok) {
        setIsPaying(false);
        alert('Razorpay SDK failed to load. Please check your connection.');
        return;
      }

      // Create order on backend
      const orderRes = await paymentService.createOrder(total);
      if (!orderRes.success) {
        setIsPaying(false);
        alert('Error creating payment order: ' + (orderRes.message || 'Unknown error'));
        return;
      }

      const { order } = orderRes;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: order.amount,
        currency: order.currency,
        name: 'GoldenDrops',
        description: 'Order Payment',
        order_id: order.id,
        prefill: {
          name: fullName || user?.name || '',
          email: email || user?.email || '',
        },
        handler: async function (response) {
          const verifyPayload = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            items: checkoutItems.map((item) => ({
              productId: item.id,
              name: item.name,
              price: parsePrice(item.price),
              quantity: item.quantity,
            })),
            totalAmount: total,
            shippingAddress: {
              name: fullName || user?.name || '',
              phone,
              street: address,
              city: '',
              state: '',
              zipCode: '',
              country: 'India',
            },
          };

          const verifyRes = await paymentService.verifyPayment(verifyPayload);
          if (verifyRes.success) {
            const order = verifyRes.order;

            if (location.state?.from === 'cart') {
              clearCart();
            }

            navigate('/order/confirmation', { state: { order } });
          } else {
            alert('Payment verification failed: ' + (verifyRes.message || 'Unknown error'));
          }

          setIsPaying(false);
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
        theme: {
          color: '#f97316',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error', error);
      alert('Error initiating payment. Please try again.');
      setIsPaying(false);
    }
  };

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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <input
                  className="border border-amber-200 rounded-lg px-4 py-3"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <input
                className="w-full border border-amber-200 rounded-lg px-4 py-3 mb-6"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <h2 className="text-lg font-semibold text-amber-900 mb-3">Delivery Address</h2>
              <textarea
                className="w-full border border-amber-200 rounded-lg px-4 py-3 min-h-28 mb-6"
                placeholder="Enter your complete delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />

              <button
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition"
                type="button"
                onClick={handlePayNow}
                disabled={isPaying}
              >
                {isPaying
                  ? 'Processing Payment...'
                  : `Pay Now - ₹${total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
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
