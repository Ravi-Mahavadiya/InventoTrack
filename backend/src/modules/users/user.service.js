import User from "./user.model.js";
import Post from "../posts/post.model.js";
import { comparePassword, hashPassword } from "../../utils/password.js";

export const getById = async (id) => {
  try {
    return User.findById(id).select("-password");
  } catch (err) {
    console.log("error from UserService.getById", err);
    throw err;
  }
};

export const updateProfile = async (userId, data) => {
  try {
    const update = {};
    if (data.name) update.name = data.name;
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("-password");
    return user;
  } catch (err) {
    console.log("error from UserService.updateProfile", err);
    throw err;
  }
};

export const deleteAccount = async (userId) => {
  try {
    await Post.deleteMany({ author: userId });
    await User.findByIdAndDelete(userId);
  } catch (err) {
    console.log("error from UserService.deleteAccount", err);
    throw err;
  }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");
    if (!user)
      throw Object.assign(new Error("User not found"), { status: 404 });
    const ok = await comparePassword(currentPassword, user.password);
    if (!ok)
      throw Object.assign(new Error("Current password incorrect"), {
        status: 401,
      });
    const hashed = await hashPassword(newPassword);
    user.password = hashed;
    await user.save();
    // refresh tokens removed; no cleanup required
  } catch (err) {
    console.log("error from UserService.changePassword", err);
    throw err;
  }
};
