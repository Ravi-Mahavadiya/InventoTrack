import express from "express";
import * as controller from "./product.controller.js";
import { adjustStock } from "../transactions/transaction.controller.js";
import auth, { authorize } from "../../middleware/auth.middleware.js";
import validation from "../../middleware/validation.middleware.js";
import { createProductSchema, updateProductSchema } from "./product.validator.js";
import { stockAdjustmentSchema } from "../transactions/transaction.validator.js";

const router = express.Router();

// Protect all product endpoints with auth
router.use(auth);

router.get("/", authorize("PRODUCT", "VIEW"), controller.getProducts);
router.get("/export", authorize("PRODUCT", "VIEW"), controller.exportCSV);
router.post("/import", authorize("PRODUCT", "CREATE"), controller.importCSV);
router.get("/:id", authorize("PRODUCT", "VIEW"), controller.getProductById);
router.get("/:id/qrcode", authorize("PRODUCT", "VIEW"), controller.getProductQRCode);
router.post("/", authorize("PRODUCT", "CREATE"), validation(createProductSchema), controller.createProduct);
router.put("/:id", authorize("PRODUCT", "EDIT"), validation(updateProductSchema), controller.updateProduct);
router.patch("/:id/stock", authorize("STOCK_TRANSACTION", "EDIT"), validation(stockAdjustmentSchema), adjustStock);
router.delete("/:id", authorize("PRODUCT", "DELETE"), controller.deleteProduct);

export default router;



