import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50/30 px-4">
          <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-amber-900 mb-4">No Order Found</h1>
            <p className="text-amber-700 mb-6">We couldn't find order details. Please place an order again.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + 5);

  const formatDate = (date) =>
    date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const { shippingAddress = {} } = order;
  const paymentStatus = order.paymentStatus || 'pending';
  const paymentLabel = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
  const orderStatusLabel = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-amber-50/30 py-10 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100">
            <h1 className="text-3xl font-bold text-amber-900 mb-2">Order Confirmed!</h1>
            <p className="text-amber-700 mb-6">Thank you for your purchase. Your order has been placed successfully.</p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-emerald-700 font-semibold">Order Number</p>
              <p className="text-xl font-bold text-emerald-900 mt-1">{order.orderNumber}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-700">Payment Status</p>
                <p className="text-lg font-bold text-amber-900 mt-1">{paymentLabel}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-700">Order Status</p>
                <p className="text-lg font-bold text-amber-900 mt-1">{orderStatusLabel}</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm text-amber-700">Payment Method</p>
                <p className="text-lg font-bold text-amber-900 mt-1">{String(order.paymentMethod || 'card').toUpperCase()}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-amber-900 mb-2">Delivery To</h2>
                <div className="text-sm text-amber-800 space-y-1">
                  <p className="font-semibold">{shippingAddress.name}</p>
                  {shippingAddress.phone && <p>📞 {shippingAddress.phone}</p>}
                  {shippingAddress.street && <p>{shippingAddress.street}</p>}
                  <p>
                    {shippingAddress.city && `${shippingAddress.city}, `}
                    {shippingAddress.state && `${shippingAddress.state} `}
                    {shippingAddress.zipCode && `- ${shippingAddress.zipCode}`}
                  </p>
                  {shippingAddress.country && <p>{shippingAddress.country}</p>}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-amber-900 mb-2">Delivery Status</h2>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>✅ Order confirmed</li>
                  <li>📦 Preparing for shipment</li>
                  <li>🚚 Estimated delivery: <span className="font-semibold">{formatDate(estimatedDate)}</span></li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-amber-900 mb-3">Ordered Items</h2>
              <div className="space-y-3">
                {(order.items || []).map((item, index) => (
                  <div key={`${item.product || item.name}-${index}`} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                    <div>
                      <p className="font-semibold text-amber-900">{item.name}</p>
                      <p className="text-sm text-amber-700">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-amber-900">
                      ₹{Number(item.subtotal || item.price * item.quantity || 0).toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-amber-100 pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-amber-700">Total Amount</p>
                <p className="text-2xl font-bold text-pink-500">₹{order.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderConfirmation;
