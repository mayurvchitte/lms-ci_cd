import express from "express";
import { getAllUsers, updateUserRole, deleteUser, getSystemStats, updateUserStatus } from "../controllers/adminController.js";
import isAuth from "../middlewares/isAuth.js";
import User from "../models/userModel.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(isAuth);

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    req.user = user; // Attach user to request for later use
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authorization error" });
  }
};

// Apply admin middleware to all routes
router.use(isAdmin);

// Admin routes
router.get('/users', getAllUsers);
router.put('/users/role', updateUserRole);
router.put('/users/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);
router.get('/stats', getSystemStats);

export default router;
