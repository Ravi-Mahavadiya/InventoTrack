import express from "express";
import * as controller from "./category.controller.js";
import auth, { authorize } from "../../middleware/auth.middleware.js";
import validation from "../../middleware/validation.middleware.js";
import { createCategorySchema, updateCategorySchema } from "./category.validator.js";

const router = express.Router();

// Protect all category routes with auth
router.use(auth);

router.get("/", authorize("CATEGORY", "VIEW"), controller.getAllCategories);
router.get("/:id", authorize("CATEGORY", "VIEW"), controller.getCategoryById);
router.post("/", authorize("CATEGORY", "CREATE"), validation(createCategorySchema), controller.createCategory);
router.put("/:id", authorize("CATEGORY", "EDIT"), validation(updateCategorySchema), controller.updateCategory);
router.delete("/:id", authorize("CATEGORY", "DELETE"), controller.deleteCategory);

export default router;
