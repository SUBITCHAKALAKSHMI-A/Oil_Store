import express from 'express';
import { isAdmin } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get admin dashboard stats
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        admin: req.adminData
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data',
      error: error.message 
    });
  }
});

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// Get admin profile
router.get('/profile', isAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.adminData
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile',
      error: error.message 
    });
  }
});

export default router;
