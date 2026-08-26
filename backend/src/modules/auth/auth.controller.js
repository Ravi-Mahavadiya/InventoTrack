import * as authService from "./auth.service.js";
import { success } from "../../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return success(res, "User registered successfully", result, 201);
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return success(res, "Login successful", result, 200);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    return success(res, "Logged out successfully", {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    return success(res, "User profile fetched successfully", user, 200);
  } catch (err) {
    return next(err);
  }
};

