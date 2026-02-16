import express from 'express';
import { isAuth } from '../middleware/auth.js';

const router = express.Router();

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

export default router;
