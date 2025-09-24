import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Test route
export const test = (req, res) => {
  res.json({
    message: "API route is working!",
  });
};

// Update user
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only update your own account!"));
  }

  try {
    // Prepare updated data
    const updateData = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar,
    };

    // Only hash and update password if provided
    if (req.body.password) {
      updateData.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return next(errorHandler(404, "User not found"));
    }

    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);

  } catch (error) {
    next(errorHandler(500, `Failed to update user: ${error.message}`));
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next(errorHandler(401, "You can only delete your own account!"));
  }

  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return next(errorHandler(404, "User not found"));
    }

    res.clearCookie("access_token");
    res.status(200).json({ success: true, message: "User has been deleted!" });

  } catch (error) {
    next(errorHandler(500, `Failed to delete user: ${error.message}`));
  }
};
