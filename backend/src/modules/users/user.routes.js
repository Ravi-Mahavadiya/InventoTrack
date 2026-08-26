import express from "express";
import * as controller from "./user.controller.js";
import auth from "../../middleware/auth.middleware.js";
import validation from "../../middleware/validation.middleware.js";
import { updateProfileSchema, changePasswordSchema, createUserSchema } from "./user.validator.js";

const router = express.Router();

router.post("/", auth, validation(createUserSchema), controller.createUser);
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
