import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

// Verify JWT Token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token.' 
    });
  }
};

// Check if user is authenticated
export const isAuth = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      if (req.user.role === 'user') {
        const user = await User.findById(req.user.id);
        if (!user || !user.isActive) {
          return res.status(403).json({ 
            success: false, 
            message: 'User account is inactive or not found.' 
          });
        }
        req.userData = user;
        next();
      } else {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. User authentication required.' 
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error.' 
    });
  }
};

// Check if admin is authenticated
export const isAdmin = async (req, res, next) => {
  try {
    await verifyToken(req, res, async () => {
      if (req.user.role === 'admin' || req.user.role === 'superadmin') {
        const admin = await Admin.findById(req.user.id);
        if (!admin || !admin.isActive) {
          return res.status(403).json({ 
            success: false, 
            message: 'Admin account is inactive or not found.' 
          });
        }
        req.adminData = admin;
        next();
      } else {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error.' 
    });
  }
};

// Generate JWT Token
export const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
