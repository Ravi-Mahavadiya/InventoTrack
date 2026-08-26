import express from "express";
import * as controller from "./auditLog.controller.js";
import auth from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", auth, controller.getAuditLogs);

export default router;
