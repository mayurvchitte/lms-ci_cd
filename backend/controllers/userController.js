import User from "../models/userModel.js";

// ✅ Fetch all users with active/inactive status (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).populate('enrolledCourses');

    // Update status based on inactivity & enrolled courses
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        user.checkInactive(); // checks lastLogin & enrolledCourses
        await user.save();
        return user;
      })
    );

    res.json(updatedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Toggle user status manually (admin)
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.json({ message: `User marked as ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update user profile
export const UpdateProfile = async (req, res) => {
  try {
    const { userId } = req.user; // set by isAuth middleware
    const { name, email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // hash if needed
    if (req.file) user.photoUrl = req.file.filename;

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId).populate('enrolledCourses wishlist');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Wishlist: add course
export const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.wishlist.includes(courseId)) {
      user.wishlist.push(courseId);
      await user.save();
    }

    res.json({ message: "Course added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Wishlist: remove course
export const removeFromWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const { courseId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = user.wishlist.filter((id) => id.toString() !== courseId);
    await user.save();

    res.json({ message: "Course removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId).populate('wishlist');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};