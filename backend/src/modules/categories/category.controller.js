import * as categoryService from "./category.service.js";
import { success } from "../../utils/response.js";

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return success(res, "Categories fetched successfully", categories, 200);
  } catch (err) {
    return next(err);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return success(res, "Category details fetched successfully", category, 200);
  } catch (err) {
    return next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return success(res, "Category created successfully", category, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return success(res, "Category updated successfully", category, 200);
  } catch (err) {
    return next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return success(res, result.message, {}, 200);
  } catch (err) {
    return next(err);
  }
};
