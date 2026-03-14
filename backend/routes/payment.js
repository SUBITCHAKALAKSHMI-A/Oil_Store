import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { isAuth } from '../middleware/auth.js';
import Order from '../models/Order.js';

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

    // Map items into Order schema format (assumes each item has productId, name, price, quantity)
    const orderItems = (items || []).map((item) => ({
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
      paymentMethod: 'card',
      paymentStatus: 'paid',
      shippingAddress
    });

    await order.save();

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
