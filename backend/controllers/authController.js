import { genToken } from "../configs/token.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import sendMail from "../configs/Mail.js";

/* ========================= SIGNUP ========================= */

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    const session = global.signupOtps?.[email];

    if (!session || !session.verified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: session.name,
      email,
      password: hashPassword,
      role: session.role
    });

    delete global.signupOtps[email];

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ message: "Signup successful", user });

  } catch (error) {
    console.error("signUp error:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
};

/* ========================= LOGIN ========================= */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User does not exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = await genToken(user._id);

    user.lastLoginAt = Date.now();
    if (typeof user.isActive === "undefined") user.isActive = true;
    await user.save();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json(user);

  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

/* ========================= LOGOUT ========================= */

export const logOut = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax"
    });

    return res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    console.error("logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
};

/* ========================= GOOGLE SIGNUP ========================= */

export const googleSignup = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, role });
    }

    user.lastLoginAt = Date.now();
    if (typeof user.isActive === "undefined") user.isActive = true;
    await user.save();

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json(user);

  } catch (error) {
    console.error("googleSignup error:", error);
    return res.status(500).json({ message: "Google signup failed" });
  }
};

/* ========================= SEND OTP ========================= */

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;

    await user.save();
    await sendMail(email, `Your OTP is <b>${otp}</b>`);

    return res.status(200).json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: "Send OTP failed" });
  }
};

/* ========================= VERIFY OTP ========================= */

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: "Verify OTP failed" });
  }
};

/* ========================= FORGOT PASSWORD ========================= */

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();

    await sendMail(
      email,
      `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`
    );

    return res.status(200).json({ message: "OTP sent to email" });

  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ message: "Forgot password failed" });
  }
};

/* ========================= RESET PASSWORD ========================= */

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Reset password failed" });
  }
};

/* ========================= AUTO CLEAN OTP ========================= */

setInterval(() => {
  if (!global.signupOtps) return;
  const now = Date.now();

  for (const email in global.signupOtps) {
    if (global.signupOtps[email].expires < now) {
      delete global.signupOtps[email];
    }
  }
}, 60 * 1000);

