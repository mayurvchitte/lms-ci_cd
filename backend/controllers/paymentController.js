import razorpay from "../configs/razorpay.js";
import crypto from "crypto";
import Course from "../models/courseModel.js";
import Payment from "../models/payment.js"; // use Payment model here
import User from "../models/userModel.js";

export const createOrder = async (req, res) => {
  const { courseId } = req.body;

  const alreadyEnrolled = await Payment.findOne({
    userId: req.user._id,
    courseId,
    status: "paid",
  });

  if (alreadyEnrolled) {
    return res.status(400).json({ message: "Already enrolled" });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const order = await razorpay.orders.create({
    amount: course.price * 100,
    currency: "INR",
    receipt: `course_${courseId}`,
  });

  // Save the order in Payment collection
  await Payment.create({
    userId: req.user._id,
    courseId,
    razorpay_order_id: order.id,
    amount: course.price * 100,
    currency: "INR",
    status: "created",
  });

  res.json({
    order,
    key: process.env.RAZORPAY_KEY_ID,
  });
};

export const verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    courseId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  // Find payment
  const payment = await Payment.findOne({ razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment record not found" });
  }

  // Update payment
  payment.razorpay_payment_id = razorpay_payment_id;
  payment.razorpay_signature = razorpay_signature;
  payment.status = "paid";
  payment.paidAt = new Date();
  await payment.save();

  // ✅ ENROLL USER IN COURSE (IMPORTANT)
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { enrolledCourses: courseId },
  });

  res.json({ success: true });
};
