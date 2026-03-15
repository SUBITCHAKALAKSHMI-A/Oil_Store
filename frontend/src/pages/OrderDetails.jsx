import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import orderService from '../services/orderService';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelReasonOption, setCancelReasonOption] = useState('');
  const [cancelReasonNotes, setCancelReasonNotes] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await orderService.getOrderById(orderId);
        if (data?.success) {
          setOrder(data.order);
        } else {
          setError(data?.message || 'Failed to load order');
        }
      } catch (err) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getStatusBadgeClasses = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancel = order && (order.status === 'pending' || order.status === 'processing');

  const handleCancel = async (event) => {
    event.preventDefault();
    if (!order || !canCancel || cancelling) return;

    if (!cancelReasonOption) {
      setCancelError('Please select a reason for cancellation.');
      return;
    }

    const reasonLabels = {
      price_drop: 'I found the product at a lower price',
      change_delivery_date: 'I need delivery on a different date',
      change_address: 'I need to change the delivery address',
      ordered_by_mistake: 'I ordered by mistake / selected wrong product',
      no_longer_needed: 'I no longer need this product',
      other: 'Other reason',
    };

    const baseReason = reasonLabels[cancelReasonOption] || 'Other reason';
    const notes = cancelReasonNotes.trim();
    const reasonToSend = notes ? `${baseReason} - ${notes}` : baseReason;

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCancelling(true);
      setCancelError('');
      const data = await orderService.cancelOrder(order._id, reasonToSend);
      if (data?.success) {
        setOrder(data.order);
      } else {
        setCancelError(data?.message || 'Failed to cancel order');
      }
    } catch (err) {
      setCancelError('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const renderTimeline = () => {
    if (!order) return null;

    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStatus = order.status;
    const cancelled = currentStatus === 'cancelled';

    const currentIndex = cancelled
      ? steps.indexOf('processing')
      : steps.indexOf(currentStatus === 'pending' ? 'pending' : currentStatus);

    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Order progress</h2>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = !cancelled && index <= currentIndex;
            const isActive = !cancelled && index === currentIndex;
            const label = step.charAt(0).toUpperCase() + step.slice(1);

            return (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ' +
                      (isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-400')
                    }
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs text-gray-600">{label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={
                      'flex-1 h-0.5 mx-2 ' +
                      (index < currentIndex && !cancelled ? 'bg-green-500' : 'bg-gray-200')
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
        {cancelled && (
          <p className="mt-4 text-xs text-red-600 font-medium">
            Order was cancelled by {order.cancelledBy || 'user'} on{' '}
            {order.cancelledAt
              ? new Date(order.cancelledAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '—'}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
                {order && (
                  <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500 text-sm">
              Loading order details...
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-red-500 text-sm">{error}</div>
          ) : !order ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-gray-500 text-sm">
              Order not found.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status & summary */}
              <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                      order.status,
                    )}`}
                  >
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                  </span>
                  <p className="text-xs text-gray-500 mt-3">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {order.deliveredAt && (
                    <p className="text-xs text-gray-500 mt-1">
                      Delivered on{' '}
                      {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Payment: {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PENDING'}
                  </p>
                  {order.status === 'cancelled' && order.cancelReason && (
                    <p className="mt-2 text-xs text-red-600 max-w-xs ml-auto text-right">
                      Reason: {order.cancelReason}
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              {renderTimeline()}

              {/* Cancel order */}
              {canCancel && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Need to cancel this order?</h2>
                  <p className="text-xs text-gray-500 mb-3">
                    You can cancel while the order is still pending or processing. Once it is shipped, cancellation may not be possible.
                  </p>
                  <form onSubmit={handleCancel} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Select a reason
                      </label>
                      <select
                        value={cancelReasonOption}
                        onChange={(event) => setCancelReasonOption(event.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        <option value="">Choose a reason</option>
                        <option value="price_drop">I found the product at a lower price</option>
                        <option value="change_delivery_date">I need delivery on a different date</option>
                        <option value="change_address">I need to change the delivery address</option>
                        <option value="ordered_by_mistake">I ordered by mistake / selected wrong product</option>
                        <option value="no_longer_needed">I no longer need this product</option>
                        <option value="other">Other reason</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Additional details (optional)
                      </label>
                      <textarea
                        rows={3}
                        value={cancelReasonNotes}
                        onChange={(event) => setCancelReasonNotes(event.target.value)}
                        placeholder="Add any extra information, for example: product rate changed, want delivery after a specific date, etc."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    {cancelError && (
                      <p className="text-xs text-red-600">{cancelError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={cancelling}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  </form>
                </div>
              )}

              {/* Shipping address */}
              {order.shippingAddress && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h2>
                  <div className="text-sm text-gray-700 space-y-1">
                    {order.shippingAddress.name && <p>{order.shippingAddress.name}</p>}
                    {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                    <p>
                      {[order.shippingAddress.street, order.shippingAddress.city]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    <p>
                      {[order.shippingAddress.state, order.shippingAddress.zipCode]
                        .filter(Boolean)
                        .join(' - ')}
                    </p>
                    {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <div key={item._id} className="py-3 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0">
                        {item.product && item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${item.product.images[0]}`}
                            alt={item.name || item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {item.name || item.product?.name || 'Product'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} · Price: {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="text-right text-sm font-semibold text-gray-900">
                        {formatCurrency(item.subtotal || item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderDetails;
