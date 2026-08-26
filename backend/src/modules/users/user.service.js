import User from "./user.model.js";
import Role from "../roles/role.model.js";
import { comparePassword, hashPassword } from "../../utils/password.js";

export const getById = async (id) => {
  try {
    return User.findById(id).populate("role").select("-password");
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
    }).populate("role").select("-password");
    return user;
  } catch (err) {
    console.log("error from UserService.updateProfile", err);
    throw err;
  }
};

export const deleteAccount = async (userId) => {
  try {
    await User.findByIdAndDelete(userId);
  } catch (err) {
    console.log("error from UserService.deleteAccount", err);
    throw err;
  }
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw Object.assign(new Error("User not found"), { status: 404 });
    }
    const ok = await comparePassword(currentPassword, user.password);
    if (!ok) {
      throw Object.assign(new Error("Current password incorrect"), { status: 401 });
    }
    const hashed = await hashPassword(newPassword);
    user.password = hashed;
    await user.save();
  } catch (err) {
    console.log("error from UserService.changePassword", err);
    throw err;
  }
};

// --- User Management CRUD ---

export const createUser = async ({ name, email, password, role_id }) => {
  const normalized = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalized });
  if (existing) {
    throw Object.assign(new Error("Email already in use"), { status: 409 });
  }

  const role = await Role.findById(role_id);
  if (!role) {
    throw Object.assign(new Error("Invalid Role ID"), { status: 400 });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: normalized,
    password: hashed,
    role: role._id
  });

  return User.findById(user._id).populate("role").select("-password");
};

export const getUsers = async () => {
  return User.find().populate("role").select("-password");
};

export const getUserById = async (id) => {
  const user = await User.findById(id).populate("role").select("-password");
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  return user;
};

export const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const update = {};
  if (data.name) update.name = data.name.trim();
  if (data.email) {
    const normalized = data.email.toLowerCase().trim();
    if (normalized !== user.email) {
      const existing = await User.findOne({ email: normalized });
      if (existing) {
        throw Object.assign(new Error("Email already in use"), { status: 409 });
      }
      update.email = normalized;
    }
  }

  if (data.password) {
    update.password = await hashPassword(data.password);
  }

  if (data.role_id) {
    const role = await Role.findById(data.role_id);
    if (!role) {
      throw Object.assign(new Error("Invalid Role ID"), { status: 400 });
    }
    update.role = role._id;
  }

  return User.findByIdAndUpdate(id, update, { new: true })
    .populate("role")
    .select("-password");
};

export const deleteUser = async (id, requestingUserId) => {
  if (id === requestingUserId) {
    throw Object.assign(new Error("You cannot delete your own account"), { status: 400 });
  }

  const userToDelete = await User.findById(id);
  if (!userToDelete) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  const adminRole = await Role.findOne({ name: "ADMIN" });
  if (adminRole && userToDelete.role.toString() === adminRole._id.toString()) {
    const adminCount = await User.countDocuments({ role: adminRole._id });
    if (adminCount <= 1) {
      throw Object.assign(new Error("Cannot delete the only administrator in the system"), { status: 400 });
    }
  }

  await User.findByIdAndDelete(id);
  return { message: "User deleted successfully" };
};
