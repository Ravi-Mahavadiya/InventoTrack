import express from "express";
import * as controller from "./category.controller.js";
import auth from "../../middleware/auth.middleware.js";
import validation from "../../middleware/validation.middleware.js";
import { createCategorySchema, updateCategorySchema } from "./category.validator.js";

const router = express.Router();

// Protect all category routes with auth
router.use(auth);

router.get("/", controller.getAllCategories);
router.get("/:id", controller.getCategoryById);
router.post("/", validation(createCategorySchema), controller.createCategory);
router.put("/:id", validation(updateCategorySchema), controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

export default router;
