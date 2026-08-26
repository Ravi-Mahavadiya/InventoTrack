import * as productService from "./product.service.js";
import { success } from "../../utils/response.js";

export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    return success(res, "Products fetched successfully", result, 200);
  } catch (err) {
    return next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return success(res, "Product details fetched successfully", product, 200);
  } catch (err) {
    return next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return success(res, "Product created successfully", product, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return success(res, "Product updated successfully", product, 200);
  } catch (err) {
    return next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    return success(res, result.message, {}, 200);
  } catch (err) {
    return next(err);
  }
};
