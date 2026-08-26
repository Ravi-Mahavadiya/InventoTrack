import * as transactionService from "./transaction.service.js";
import { success } from "../../utils/response.js";

export const adjustStock = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user ? req.user._id : null;
    const result = await transactionService.adjustStock(productId, req.body, userId);
    return success(res, "Stock quantity updated successfully", result, 200);
  } catch (err) {
    return next(err);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const result = await transactionService.getTransactions(req.query);
    return success(res, "Transactions fetched successfully", result, 200);
  } catch (err) {
    return next(err);
  }
};
