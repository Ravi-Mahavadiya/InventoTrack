import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
// refresh token support removed - single JWT token used

export function signAccessToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, jwtSecret);
}

export function signRefreshToken(payload) {
  throw new Error("refresh tokens removed");
}

export function verifyRefreshToken(token) {
  throw new Error("refresh tokens removed");
}
