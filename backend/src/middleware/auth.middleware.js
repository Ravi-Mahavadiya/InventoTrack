import { verifyAccessToken } from "../utils/jwt.js";
import User from "../modules/users/user.model.js";

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
    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized access. User not found." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized access. Invalid or expired token." });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({ success: false, message: "Forbidden. Insufficient permissions." });
    }
    next();
  };
}

