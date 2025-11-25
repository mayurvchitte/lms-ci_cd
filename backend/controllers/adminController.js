import User from "../models/userModel.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    // Populate enrolledCourses to include course titles for admin UI
    const users = await User.find({}, '-password').populate({ path: 'enrolledCourses', select: 'title' }); // Exclude password field
    return res.status(200).json(users);
  } catch (error) {
    console.log("getAllUsers error:", error);
    return res.status(500).json({ message: `Get all users error: ${error.message}` });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!['admin', 'educator', 'student'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be admin, educator, or student." });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    console.log("updateUserRole error:", error);
    return res.status(500).json({ message: `Update user role error: ${error.message}` });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("deleteUser error:", error);
    return res.status(500).json({ message: `Delete user error: ${error.message}` });
  }
};

// Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const educatorUsers = await User.countDocuments({ role: 'educator' });
    const studentUsers = await User.countDocuments({ role: 'student' });

    const stats = {
      totalUsers,
      adminUsers,
      educatorUsers,
      studentUsers
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.log("getSystemStats error:", error);
    return res.status(500).json({ message: `Get system stats error: ${error.message}` });
  }
};

// Update user active status (admin only)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be boolean' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User status updated', user });
  } catch (error) {
    console.log('updateUserStatus error:', error);
    return res.status(500).json({ message: `Update user status error: ${error.message}` });
  }
};
