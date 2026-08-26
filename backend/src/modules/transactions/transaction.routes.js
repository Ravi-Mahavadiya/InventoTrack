import express from "express";
import * as controller from "./transaction.controller.js";
import auth, { authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Protect all transaction routes
router.use(auth);

router.get("/", authorize("STOCK_TRANSACTION", "EDIT"), controller.getTransactions);

export default router;
