import User from "../users/user.model.js";
import Role from "../roles/role.model.js";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { signAccessToken } from "../../utils/jwt.js";

export const register = async ({ name, email, password }) => {
  const normalized = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalized });
  if (existing) {
    throw Object.assign(new Error("Email is already registered"), { status: 409 });
  }

  // First user is Admin, others are Staff
  const userCount = await User.countDocuments({});
  const targetRoleName = userCount === 0 ? "ADMIN" : "STAFF";
  
  let dbRole = await Role.findOne({ name: targetRoleName });
  if (!dbRole) {
    dbRole = await Role.create({ name: targetRoleName });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    name: name.trim(),
    email: normalized,
    password: hashed,
    role: dbRole._id,
  });

  const populatedUser = await User.findById(user._id).populate("role");
  const token = signAccessToken({ userId: user._id.toString() });

  return {
    user: {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      createdAt: populatedUser.createdAt,
    },
    token,
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password").populate("role");

  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }
  const ok = await comparePassword(password, user.password);
  if (!ok) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }

  const token = signAccessToken({ userId: user._id.toString() });
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).populate("role").select("-password");
  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }
  return user;
};

