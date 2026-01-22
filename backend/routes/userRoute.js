import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const router = express.Router();

// ✅ Get current user (with cookie)
router.get("/currentuser", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update active/inactive status automatically
    user.checkInactive();
    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
});

// ✅ Get user notifications
router.get("/notifications", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Return notifications (empty array if none)
    res.json(user.notifications || []);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
});


export default router;