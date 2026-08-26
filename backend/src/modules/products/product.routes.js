import express from "express";
import * as controller from "./product.controller.js";
import { adjustStock } from "../transactions/transaction.controller.js";
import auth from "../../middleware/auth.middleware.js";
import validation from "../../middleware/validation.middleware.js";
import { createProductSchema, updateProductSchema } from "./product.validator.js";
import { stockAdjustmentSchema } from "../transactions/transaction.validator.js";

const router = express.Router();

// Protect all product endpoints with auth
router.use(auth);

router.get("/", controller.getProducts);
router.get("/export", controller.exportCSV);
router.post("/import", controller.importCSV);
router.get("/:id", controller.getProductById);
router.get("/:id/qrcode", controller.getProductQRCode);
router.post("/", validation(createProductSchema), controller.createProduct);
router.put("/:id", validation(updateProductSchema), controller.updateProduct);
router.patch("/:id/stock", validation(stockAdjustmentSchema), adjustStock);
router.delete("/:id", controller.deleteProduct);

export default router;



