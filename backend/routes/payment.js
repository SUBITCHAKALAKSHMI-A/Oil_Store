import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { isAuth } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// Ensure environment variables from .env are loaded
dotenv.config();

// Initialize Razorpay instance with env variables
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.error('Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// Create Razorpay order for checkout
router.post('/create-order', isAuth, async (req, res) => {
  try {
    const { amount } = req.body; // amount in INR (e.g. 420)

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    return res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.error?.description || error.message
    });
  }
});

// Verify payment and create local Order (basic version)
router.post('/verify', isAuth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      shippingAddress
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid total amount is required'
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_placeholder';

    const data = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(data)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const normalizedItems = items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity)
    }));

    const invalidItem = normalizedItems.find(
      (item) => !item.productId || !item.name || Number.isNaN(item.price) || item.price < 0 || !Number.isInteger(item.quantity) || item.quantity < 1
    );

    if (invalidItem) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order item payload'
      });
    }

    const quantityByProductId = normalizedItems.reduce((accumulator, item) => {
      const currentQuantity = accumulator.get(item.productId) || 0;
      accumulator.set(item.productId, currentQuantity + item.quantity);
      return accumulator;
    }, new Map());

    const productIds = [...quantityByProductId.keys()];
    const products = await Product.find({ _id: { $in: productIds } }).select('name stockQuantity inStock');
    const productMap = new Map(products.map((product) => [String(product._id), product]));

    for (const [productId, requestedQuantity] of quantityByProductId.entries()) {
      const product = productMap.get(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'One or more products were not found'
        });
      }

      if (product.stockQuantity < requestedQuantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has only ${product.stockQuantity} item(s) left in stock`
        });
      }
    }

    const stockUpdates = [...quantityByProductId.entries()].map(([productId, requestedQuantity]) => {
      const product = productMap.get(productId);
      const remainingStock = product.stockQuantity - requestedQuantity;

      return {
        updateOne: {
          filter: {
            _id: productId,
            stockQuantity: { $gte: requestedQuantity }
          },
          update: {
            $inc: { stockQuantity: -requestedQuantity },
            $set: { inStock: remainingStock > 0 }
          }
        }
      };
    });

    const stockUpdateResult = await Product.bulkWrite(stockUpdates);

    if (stockUpdateResult.modifiedCount !== stockUpdates.length) {
      return res.status(409).json({
        success: false,
        message: 'Stock changed while processing the order. Please review your cart and try again.'
      });
    }

    const orderItems = normalizedItems.map((item) => ({
      product: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    }));

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      status: 'processing',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      paidAt: new Date(),
      paymentId: razorpay_payment_id,
      paymentOrderId: razorpay_order_id,
      shippingAddress
    });

    try {
      await order.save();
    } catch (error) {
      await Product.bulkWrite(
        [...quantityByProductId.entries()].map(([productId, requestedQuantity]) => {
          const product = productMap.get(productId);
          const restoredStock = product.stockQuantity;

          return {
            updateOne: {
              filter: { _id: productId },
              update: {
                $inc: { stockQuantity: requestedQuantity },
                $set: { inStock: restoredStock > 0 }
              }
            }
          };
        })
      );

      throw error;
    }

    return res.status(201).json({
      success: true,
      message: 'Payment verified and order placed',
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error verifying payment',
      error: error.message
    });
  }
});

export default router;
