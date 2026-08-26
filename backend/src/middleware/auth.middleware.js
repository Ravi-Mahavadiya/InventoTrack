import { verifyAccessToken } from "../utils/jwt.js";
import User from "../modules/users/user.model.js";
import RolePermission from "../modules/roles/rolePermission.model.js";

export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized access. Token missing." });
    }
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token);
    if (!payload || !payload.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized access. Token invalid or expired." });
    }
    const user = await User.findById(payload.userId).populate("role").select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized access. User not found." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized access. Invalid or expired token." });
  }
}

export function authorize(module, action) {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action"
        });
      }

      // Query role permissions
      const roleId = req.user.role._id || req.user.role;
      const rolePermissions = await RolePermission.find({ role: roleId }).populate("permission");

      // Find permission for requested module
      const rolePerm = rolePermissions.find(
        (rp) => rp.permission && rp.permission.module === module.toUpperCase()
      );

      if (!rolePerm) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action"
        });
      }

      const actionFieldMap = {
        CREATE: "can_create",
        VIEW: "can_view",
        EDIT: "can_edit",
        DELETE: "can_delete"
      };

      const field = actionFieldMap[action.toUpperCase()];
      if (!field || !rolePerm.permission[field]) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action"
        });
      }

      next();
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }
  };
}

