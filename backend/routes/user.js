import express from 'express';
import Razorpay from 'razorpay';
import { isAuth } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

const router = express.Router();

// Razorpay instance for refunds (uses same env vars as payment routes)
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

// Get user profile
router.get('/profile', isAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.userData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/profile', isAuth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = req.userData;
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile',
      error: error.message 
    });
  }
});

// Get all categories (public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });

    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Get all products (public)
router.get('/products', async (req, res) => {
  try {
    const { category, search, featured, minPrice, maxPrice, sort } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { badge: { $regex: search, $options: 'i' } }
      ];
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate('category', 'name icon')
      .sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get single product (public)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name icon description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Search products (public)
router.get('/products/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { badge: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    }).populate('category', 'name icon');

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

// Get orders for the logged-in user
router.get('/orders', isAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
    const totalSpent = orders
      .filter(order => order.paymentStatus === 'paid' && order.status !== 'cancelled')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    res.json({
      success: true,
      count: orders.length,
      orders,
      summary: {
        totalOrders,
        deliveredOrders,
        totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user orders',
      error: error.message
    });
  }
});

// Get single order for the logged-in user
router.get('/orders/:id', isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, user: userId })
      .populate('items.product', 'name images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order details',
      error: error.message,
    });
  }
});

// Cancel an order for the logged-in user (only pending/processing)
router.post('/orders/:id/cancel', isAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This order can no longer be cancelled',
      });
    }
    // If payment was made online, attempt a Razorpay refund
    if (order.paymentStatus === 'paid' && order.paymentMethod !== 'cod' && order.paymentId && razorpay) {
      try {
        const amountPaise = Math.round((order.totalAmount || 0) * 100);

        const refund = await razorpay.payments.refund(order.paymentId, {
          amount: amountPaise,
        });

        order.paymentStatus = 'refunded';
        order.refundId = refund.id;
      } catch (refundError) {
        console.error('Error processing refund for order', order._id, refundError);
        return res.status(502).json({
          success: false,
          message: 'Unable to process refund at this time. Please try again later or contact support.',
        });
      }
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'Cancelled by user';
    order.cancelledAt = new Date();
    order.cancelledBy = 'user';

    await order.save();

    res.json({
      success: true,
      message: order.paymentStatus === 'refunded'
        ? 'Order cancelled and payment refunded successfully'
        : 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message,
    });
  }
});

export default router;
