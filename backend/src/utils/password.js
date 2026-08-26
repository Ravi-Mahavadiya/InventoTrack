import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();
const bcryptSaltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export async function hashPassword(password) {
  return bcrypt.hash(password, bcryptSaltRounds);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
