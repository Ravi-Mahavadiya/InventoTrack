import AuditLog from "./auditLog.model.js";
import { success } from "../../utils/response.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return success(res, "Audit logs fetched successfully", logs, 200);
  } catch (err) {
    console.error("Error fetching audit logs:", err);
    return next(err);
  }
};
