import express from "express";
import * as controller from "./dashboard.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

// Protect dashboard endpoint
router.use(auth);

router.get("/", controller.getDashboardSummary);

export default router;
