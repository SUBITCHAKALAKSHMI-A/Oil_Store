import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Heart, MapPin, Edit2, ShoppingCart, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import orderService from '../services/orderService';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getWishlistCount } = useCart();
  const [isEditing, setIsEditing] = useState({ name: false, phone: false });
  const [orders, setOrders] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await orderService.getMyOrders();
        if (data?.success) {
          setOrders(data.orders || []);
          setOrderSummary(data.summary || {
            totalOrders: data.count || 0,
            deliveredOrders: 0,
            totalSpent: 0,
          });
        } else {
          setOrders([]);
          setOrderSummary({ totalOrders: 0, deliveredOrders: 0, totalSpent: 0 });
        }
      } catch (error) {
        console.error('Error loading user orders:', error);
        setOrders([]);
        setOrderSummary({ totalOrders: 0, deliveredOrders: 0, totalSpent: 0 });
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // Format member since date
  const memberSince = new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

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

  const recentOrders = orders.slice(0, 3);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-md p-8 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-linear-to-br from-pink-400 to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {getInitials(user?.name)}
                  </span>
                </div>
                
                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {user?.name || 'User'}
                  </h1>
                  <p className="text-gray-500 mb-2">{user?.email}</p>
                  <p className="text-sm text-gray-400">
                    Member since {memberSince}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 text-pink-500 hover:text-pink-600 font-medium transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-pink-50 rounded-full mb-3">
                <ShoppingBag className="w-7 h-7 text-pink-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {loadingOrders ? '-' : orderSummary.totalOrders}
              </h3>
              <p className="text-gray-500 text-sm">Total Orders</p>
            </div>

            {/* Total Spent */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-pink-50 rounded-full mb-3">
                <Package className="w-7 h-7 text-pink-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {loadingOrders ? '-' : formatCurrency(orderSummary.totalSpent)}
              </h3>
              <p className="text-gray-500 text-sm">Total Spent</p>
            </div>

            {/* Favorites */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-pink-50 rounded-full mb-3">
                <Heart className="w-7 h-7 text-pink-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{getWishlistCount()}</h3>
              <p className="text-gray-500 text-sm">Favorites</p>
            </div>

            {/* Delivered */}
            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-pink-50 rounded-full mb-3">
                <MapPin className="w-7 h-7 text-pink-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {loadingOrders ? '-' : orderSummary.deliveredOrders}
              </h3>
              <p className="text-gray-500 text-sm">Delivered</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-base font-semibold text-gray-900">{user?.name || 'User'}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-50 rounded-lg transition">
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-base font-semibold text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between pb-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-base font-semibold text-gray-900">
                        {user?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-50 rounded-lg transition">
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gray-700" />
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                </div>
                <button
                  onClick={() => navigate('/user/orders')}
                  className="text-sm text-gray-900 hover:text-pink-500 font-medium transition"
                >
                  View All
                </button>
              </div>

              {loadingOrders ? (
                <div className="text-center py-12 text-gray-500 text-sm">Loading orders...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <button
                    onClick={() => navigate('/')}
                    className="text-pink-500 hover:text-pink-600 font-medium transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order._id}
                      onClick={() => navigate(`/user/orders/${order._id}`)}
                      className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition cursor-pointer"
                    >
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-400 mb-1">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-700">
                          {order.items && order.items.length > 0
                            ? `${order.items[0].name || order.items[0].product?.name || 'Product'}$${order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}`
                            : 'No items'}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                            order.status,
                          )}`}
                        >
                          {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                        </span>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <button
              onClick={() => navigate('/user/orders')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 group-hover:bg-pink-50 rounded-xl mb-3 transition">
                <ShoppingBag className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition" />
              </div>
              <p className="font-semibold text-gray-900">My Orders</p>
            </button>

            <button
              onClick={() => navigate('/wishlist')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 group-hover:bg-pink-50 rounded-xl mb-3 transition">
                <Heart className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition" />
              </div>
              <p className="font-semibold text-gray-900">Favorites</p>
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 group-hover:bg-pink-50 rounded-xl mb-3 transition">
                <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition" />
              </div>
              <p className="font-semibold text-gray-900">Shop Now</p>
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 group-hover:bg-pink-50 rounded-xl mb-3 transition">
                <Mail className="w-6 h-6 text-gray-600 group-hover:text-pink-500 transition" />
              </div>
              <p className="font-semibold text-gray-900">Contact Us</p>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;

