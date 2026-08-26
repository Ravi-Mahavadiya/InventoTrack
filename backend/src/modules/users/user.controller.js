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

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return success(res, "User created successfully", user, 201);
  } catch (err) {
    console.log("error from UserController.createUser", err);
    return next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    return success(res, "Users fetched successfully", users, 200);
  } catch (err) {
    console.log("error from UserController.getUsers", err);
    return next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return success(res, "User details fetched successfully", user, 200);
  } catch (err) {
    console.log("error from UserController.getUserById", err);
    return next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    return success(res, "User updated successfully", user, 200);
  } catch (err) {
    console.log("error from UserController.updateUser", err);
    return next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id, req.user._id.toString());
    return success(res, result.message, {}, 200);
  } catch (err) {
    console.log("error from UserController.deleteUser", err);
    return next(err);
  }
};
