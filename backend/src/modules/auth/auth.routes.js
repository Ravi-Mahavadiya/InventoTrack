import express from "express";
import * as controller from "./auth.controller.js";
import validation from "../../middleware/validation.middleware.js";
import auth from "../../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "./auth.validator.js";

const router = express.Router();

router.post("/register", validation(registerSchema), controller.register);
router.post("/login", validation(loginSchema), controller.login);
router.post("/logout", auth, controller.logout);
router.get("/me", auth, controller.getMe);

export default router;

