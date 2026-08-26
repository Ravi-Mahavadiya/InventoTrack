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

export const exportCSV = async (req, res, next) => {
  try {
    const csvContent = await productService.generateCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=\"inventory-export.csv\"");
    return res.status(200).send(csvContent);
  } catch (err) {
    return next(err);
  }
};

export const importCSV = async (req, res, next) => {
  try {
    const { csvText } = req.body;
    if (!csvText) {
      throw Object.assign(new Error("csvText is required in request body"), { status: 400 });
    }
    const result = await productService.parseAndImportCSV(csvText);
    return success(res, "CSV import completed", result, 200);
  } catch (err) {
    return next(err);
  }
};
