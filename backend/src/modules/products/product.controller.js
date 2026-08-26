import * as productService from "./product.service.js";
import { success } from "../../utils/response.js";
import AuditLog from "../auditLogs/auditLog.model.js";
import Product from "./product.model.js";

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

    // Log creation
    await AuditLog.create({
      user: req.user ? req.user._id : null,
      action: "PRODUCT_CREATED",
      productName: product.name,
      sku: product.sku,
      details: `Product "${product.name}" created with SKU ${product.sku} and initial quantity ${product.quantity}.`
    });

    return success(res, "Product created successfully", product, 201);
  } catch (err) {
    return next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const oldProduct = await Product.findById(req.params.id);
    const product = await productService.updateProduct(req.params.id, req.body);

    if (oldProduct) {
      const changes = [];
      if (req.body.name && req.body.name !== oldProduct.name) changes.push(`name changed from "${oldProduct.name}" to "${req.body.name}"`);
      if (req.body.sku && req.body.sku !== oldProduct.sku) changes.push(`SKU changed from "${oldProduct.sku}" to "${req.body.sku}"`);
      if (req.body.unitPrice && req.body.unitPrice !== oldProduct.unitPrice) changes.push(`unit price changed from $${oldProduct.unitPrice} to $${req.body.unitPrice}`);
      if (req.body.lowStockThreshold && req.body.lowStockThreshold !== oldProduct.lowStockThreshold) changes.push(`low stock threshold changed from ${oldProduct.lowStockThreshold} to ${req.body.lowStockThreshold}`);
      if (req.body.supplierName && req.body.supplierName !== oldProduct.supplierName) changes.push(`supplier name changed from "${oldProduct.supplierName}" to "${req.body.supplierName}"`);

      const details = changes.length > 0 ? changes.join(", ") : "Updated product details";

      await AuditLog.create({
        user: req.user ? req.user._id : null,
        action: "PRODUCT_UPDATED",
        productName: product.name,
        sku: product.sku,
        details
      });
    }

    return success(res, "Product updated successfully", product, 200);
  } catch (err) {
    return next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    const result = await productService.deleteProduct(req.params.id);

    if (product) {
      await AuditLog.create({
        user: req.user ? req.user._id : null,
        action: "PRODUCT_DELETED",
        productName: product.name,
        sku: product.sku,
        details: `Product "${product.name}" with SKU ${product.sku} was deleted.`
      });
    }

    return success(res, result.message, {}, 200);
  } catch (err) {
    return next(err);
  }
};

export const exportCSV = async (req, res, next) => {
  try {
    const buffer = await productService.generateExcel();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=\"inventory-export.xlsx\"");
    return res.status(200).send(buffer);
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

export const getProductQRCode = async (req, res, next) => {
  try {
    const dataUrl = await productService.generateProductQRCode(req.params.id);
    return success(res, "QR Code generated successfully", dataUrl, 200);
  } catch (err) {
    return next(err);
  }
};
