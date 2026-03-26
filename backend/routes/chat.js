import express from 'express';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_fallback_jwt_secret_change_me';

const extractAuthToken = (req) => {
  const rawHeader = req.headers.authorization;

  if (!rawHeader || typeof rawHeader !== 'string') {
    return null;
  }

  const authHeader = rawHeader.trim();
  if (!authHeader) {
    return null;
  }

  const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch?.[1]) {
    return bearerMatch[1].trim();
  }

  // Accept raw token values as a fallback for non-standard clients.
  return authHeader;
};

const getDecodedToken = (req) => {
  if (req._chatDecodedToken !== undefined) {
    return req._chatDecodedToken;
  }

  const token = extractAuthToken(req);
  if (!token) {
    req._chatDecodedToken = null;
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req._chatDecodedToken = decoded;
    return decoded;
  } catch (error) {
    // Invalid/expired tokens are expected when users are not logged in.
    if (error?.name !== 'JsonWebTokenError' && error?.name !== 'TokenExpiredError') {
      console.error('[ERROR] Token verification error:', error.message);
    }
    req._chatDecodedToken = null;
    return null;
  }
};

const parseBudget = (text) => {
  const cleaned = text.toLowerCase();
  const amountMatch = cleaned.match(/(?:rs\.?|inr|₹)?\s*(\d{2,7})/i);
  const amount = amountMatch ? Number(amountMatch[1]) : null;

  const above = /above|over|more than|greater than/.test(cleaned);
  const below = /under|below|less than|within|upto|up to/.test(cleaned);

  return { amount, mode: above ? 'above' : below ? 'below' : 'below' };
};

const isAvailabilityIntent = (text) => {
  // Only match product/inventory availability, NOT order-related questions
  const isOrderRelated = /(orders?|purchases?|spent|history|count)/.test(text);
  return !isOrderRelated && /(how many|items?|stock|available|availability)/.test(text);
};

const isBudgetIntent = (text) => {
  return /(budget|under|below|above|over|within|greater than|less than|more than|upto|up to|price|cost|rate|rates|rs\.?|inr|₹|cheaper|expensive)/.test(text);
};

const isOrderIntent = (text) => {
  return /(my\s+orders?|order\s+status|where\s+is\s+my\s+order|purchases?|recent\s+orders?|how\s+many\s+orders?|total\s+orders?|order\s+history|order\s+count|spent|money\s+spent|spent\s+on|total\s+spent)/.test(text);
};

const isAdminUserIntent = (text) => {
  return /(how\s+many\s+users?|user\s+count|total\s+users?|users?\s+here|active\s+users?|registered\s+users?|users?\s+statistics|user\s+stats)/.test(text);
};

const isAdminRevenueIntent = (text) => {
  return /(revenue|total\s+revenue|sales|earnings|total\s+sales|income|business\s+metrics|dashboard|overview)/.test(text);
};

const isAdminOrderIntent = (text) => {
  return /(all\s+orders?|total\s+orders?|order\s+statistics|order\s+summary|pending\s+orders?|shipped\s+orders?)/.test(text);
};

const getAuthUser = async (req) => {
  try {
    const decoded = getDecodedToken(req);
    if (!decoded) {
      return null;
    }

    console.log('[DEBUG] Decoded token:', { id: decoded?.id, role: decoded?.role });

    if (!decoded?.id) {
      console.log('[DEBUG] Token missing id field');
      return null;
    }

    // Check if user role - be flexible with role field variations
    if (decoded.role && decoded.role !== 'user') {
      console.log('[DEBUG] User role is not "user":', decoded.role);
      return null;
    }

    const user = await User.findById(decoded.id).select('name email role isActive');
    console.log('[DEBUG] User found:', { name: user?.name, isActive: user?.isActive });

    if (!user) {
      console.log('[DEBUG] User not found in database for id:', decoded.id);
      return null;
    }

    if (!user.isActive) {
      console.log('[DEBUG] User is not active');
      return null;
    }

    return user;
  } catch (error) {
    console.error('[ERROR] Authentication error:', error.message);
    return null;
  }
};

const getAuthAdmin = async (req) => {
  try {
    const decoded = getDecodedToken(req);
    if (!decoded) {
      return null;
    }

    console.log('[DEBUG] Admin token decoded:', { id: decoded?.id, role: decoded?.role });

    if (!decoded?.id || !['admin', 'superadmin'].includes(decoded.role)) {
      return null;
    }

    const admin = await Admin.findById(decoded.id).select('name email role isActive');
    if (!admin || !admin.isActive) {
      return null;
    }

    return admin;
  } catch (error) {
    console.error('[ERROR] Admin authentication error:', error.message);
    return null;
  }
};

router.post('/ask', async (req, res) => {
  try {
    const rawMessage = String(req.body?.message || '').trim();

    if (!rawMessage) {
      return res.status(400).json({
        success: false,
        message: 'Message is required.'
      });
    }

    const message = rawMessage.toLowerCase();
    const user = await getAuthUser(req);
    const admin = await getAuthAdmin(req);
    const greetingPrefix = (admin?.name || user?.name) ? `${(admin || user).name.split(' ')[0]}, ` : '';

    // ADMIN QUERIES
    if (admin) {
      if (isAdminUserIntent(message)) {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const activeUsers = await User.countDocuments({ role: 'user', isActive: true });
        const inactiveUsers = totalUsers - activeUsers;

        return res.json({
          success: true,
          answer: `${greetingPrefix}there are currently ${totalUsers} registered users. Active: ${activeUsers}, Inactive: ${inactiveUsers}.`
        });
      }

      if (isAdminRevenueIntent(message)) {
        const paidOrders = await Order.find({ 'paymentStatus': 'paid' })
          .select('totalAmount createdAt');

        const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const todayRevenue = paidOrders
          .filter((order) => {
            const orderDate = new Date(order.createdAt);
            const today = new Date();
            return orderDate.toDateString() === today.toDateString();
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        const totalOrders = await Order.countDocuments();
        const paidOrdersCount = paidOrders.length;

        return res.json({
          success: true,
          answer: `${greetingPrefix}total revenue: Rs ${Math.round(totalRevenue)}. Today's revenue: Rs ${Math.round(todayRevenue)}. Total orders: ${totalOrders}, Paid orders: ${paidOrdersCount}.`
        });
      }

      if (isAdminOrderIntent(message)) {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const processingOrders = await Order.countDocuments({ status: 'processing' });
        const shippedOrders = await Order.countDocuments({ status: 'shipped' });
        const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

        const pendingPayment = await Order.countDocuments({ paymentStatus: 'pending' });
        const paidOrders = await Order.countDocuments({ paymentStatus: 'paid' });

        return res.json({
          success: true,
          answer: `${greetingPrefix}total orders: ${totalOrders}. Status breakdown: ${deliveredOrders} delivered, ${shippedOrders} shipped, ${processingOrders} processing, ${pendingOrders} pending, ${cancelledOrders} cancelled. Payment: ${paidOrders} paid, ${pendingPayment} pending.`
        });
      }
    }

    // REGULAR USER QUERIES

    if (isOrderIntent(message)) {
      if (!user) {
        return res.json({
          success: true,
          answer: 'Please login to view your personalized order details. Once logged in, I can show your order history, total orders, and spending information.'
        });
      }

      // Get ALL orders for comprehensive statistics
      const allOrders = await Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .select('orderNumber status totalAmount paymentStatus createdAt items');

      if (!allOrders.length) {
        return res.json({
          success: true,
          answer: `${greetingPrefix}you do not have any orders yet. Explore products and place your first order.`
        });
      }

      // Calculate comprehensive statistics
      const totalOrderCount = allOrders.length;
      const deliveredCount = allOrders.filter((order) => order.status === 'delivered').length;
      const pendingCount = allOrders.filter((order) => order.status === 'pending').length;
      const processingCount = allOrders.filter((order) => order.status === 'processing').length;
      const shippedCount = allOrders.filter((order) => order.status === 'shipped').length;
      const cancelledCount = allOrders.filter((order) => order.status === 'cancelled').length;

      // Calculate spending
      const totalSpent = allOrders
        .filter((order) => order.paymentStatus === 'paid' && order.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const pendingAmount = allOrders
        .filter((order) => order.paymentStatus === 'pending' && order.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      // Total items purchased
      const totalItemsPurchased = allOrders.reduce((sum, order) => {
        return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
      }, 0);

      const latest = allOrders[0];

      // Determine which question the user is asking and provide relevant info
      const isCountQuery = /(how\s+many|count|total\s+orders?)/.test(message);
      const isSpentQuery = /(spent|money\s+spent|total\s+spent|spending|amount\s+paid)/.test(message);
      const isHistoryQuery = /(history|all\s+orders?|list)/.test(message);

      if (isCountQuery) {
        return res.json({
          success: true,
          answer: `${greetingPrefix}you have made a total of ${totalOrderCount} order(s). Of these: ${deliveredCount} delivered, ${shippedCount} shipped, ${processingCount} processing, ${pendingCount} pending, and ${cancelledCount} cancelled.`
        });
      }

      if (isSpentQuery) {
        return res.json({
          success: true,
          answer: `${greetingPrefix}you have spent a total of Rs ${Math.round(totalSpent)} across ${totalOrderCount} order(s). ${pendingAmount > 0 ? `You have Rs ${Math.round(pendingAmount)} pending payment.` : 'All payments are completed.'}`
        });
      }

      if (isHistoryQuery) {
        const recentOrders = allOrders.slice(0, 5);
        const orderSummary = recentOrders
          .map((o, i) => `${i + 1}. ${o.orderNumber} - ${o.status} (Rs ${o.totalAmount})`)
          .join('; ');
        return res.json({
          success: true,
          answer: `${greetingPrefix}here are your recent orders: ${orderSummary}. Total orders: ${totalOrderCount}`
        });
      }

      // Default comprehensive answer
      return res.json({
        success: true,
        answer: `${greetingPrefix}you have ${totalOrderCount} total order(s) with ${deliveredCount} delivered. Latest is ${latest.orderNumber} (${latest.status}). Total spent: Rs ${Math.round(totalSpent)}. Total items purchased: ${totalItemsPurchased}.`
      });
    }

    if (isAvailabilityIntent(message)) {
      const availableProducts = await Product.find({
        isActive: true,
        stockQuantity: { $gt: 0 }
      })
        .sort({ stockQuantity: -1 })
        .limit(5)
        .select('name stockQuantity');

      const totalProductsAvailable = await Product.countDocuments({
        isActive: true,
        stockQuantity: { $gt: 0 }
      });

      const stockAggregate = await Product.aggregate([
        { $match: { isActive: true, stockQuantity: { $gt: 0 } } },
        { $group: { _id: null, totalUnits: { $sum: '$stockQuantity' } } }
      ]);

      const totalUnits = stockAggregate[0]?.totalUnits || 0;
      const sample = availableProducts.map((p) => `${p.name} (${p.stockQuantity})`).join(', ');

      return res.json({
        success: true,
        answer: `Currently, ${totalProductsAvailable} products are available with about ${totalUnits} total units in stock. Top available items: ${sample || 'No samples found'}.`
      });
    }

    if (isBudgetIntent(message)) {
      const { amount, mode } = parseBudget(message);

      if (!amount) {
        return res.json({
          success: true,
          answer: 'Tell me your budget amount (example: "under 3000" or "above 5000") and I will suggest matching products.'
        });
      }

      const priceFilter = mode === 'above' ? { $gte: amount } : { $lte: amount };
      const products = await Product.find({
        isActive: true,
        stockQuantity: { $gt: 0 },
        price: priceFilter
      })
        .sort(mode === 'above' ? { price: 1 } : { price: -1 })
        .limit(5)
        .select('name price');

      if (!products.length) {
        return res.json({
          success: true,
          answer: `I could not find products ${mode} Rs ${amount} right now. Try a different budget range.`
        });
      }

      const list = products.map((p) => `${p.name} (Rs ${p.price})`).join(', ');
      const comparator = mode === 'above' ? 'above' : 'under';

      return res.json({
        success: true,
        answer: `Found ${products.length} products ${comparator} Rs ${amount}: ${list}.`
      });
    }

    return res.json({
      success: true,
      answer: "I'm here to help! Ask me about product availability, pricing, budget-friendly options, or your orders. What can I help you with?"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process chatbot request.',
      error: error.message
    });
  }
});

export default router;