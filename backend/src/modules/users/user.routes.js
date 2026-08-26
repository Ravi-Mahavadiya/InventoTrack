import express from "express";
import * as controller from "./user.controller.js";
import auth, { authorize } from "../../middleware/auth.middleware.js";
import validation from "../../middleware/validation.middleware.js";
import { updateProfileSchema, changePasswordSchema, createUserSchema, updateUserSchema } from "./user.validator.js";

const router = express.Router();

// User Management (Admin only permissions)
router.post("/", auth, authorize("USER", "CREATE"), validation(createUserSchema), controller.createUser);
router.get("/", auth, authorize("USER", "VIEW"), controller.getUsers);
router.get("/:id", auth, authorize("USER", "VIEW"), controller.getUserById);
router.put("/:id", auth, authorize("USER", "EDIT"), validation(updateUserSchema), controller.updateUser);
router.delete("/:id", auth, authorize("USER", "DELETE"), controller.deleteUser);

// Personal profile actions
router.get("/me", auth, controller.getMe);
router.put("/me", auth, validation(updateProfileSchema), controller.updateMe);
router.delete("/me", auth, controller.deleteMe);
router.put(
  "/change-password",
  auth,
  validation(changePasswordSchema),
  controller.changePassword,
);

export default router;
