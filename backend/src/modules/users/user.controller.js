import * as userService from "./user.service.js";
import { success } from "../../utils/response.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getById(req.user.id);
    return success(res, "Profile fetched", user);
  } catch (err) {
    console.log("error from UserController.getMe", err);
    return next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    return success(res, "Profile updated", user);
  } catch (err) {
    console.log("error from UserController.updateMe", err);
    return next(err);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.id);
    return success(res, "Account deleted");
  } catch (err) {
    console.log("error from UserController.deleteMe", err);
    return next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    return success(res, "Password changed");
  } catch (err) {
    console.log("error from UserController.changePassword", err);
    return next(err);
  }
};
