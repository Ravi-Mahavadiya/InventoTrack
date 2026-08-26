import * as dashboardService from "./dashboard.service.js";
import { success } from "../../utils/response.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary();
    return success(res, "Dashboard summary fetched successfully", summary, 200);
  } catch (err) {
    return next(err);
  }
};
