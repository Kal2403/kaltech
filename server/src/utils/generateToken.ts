import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  role: "customer" | "admin";
}

export const generateToken = (payload: TokenPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: "7d",
  };

  return jwt.sign(payload, jwtSecret as Secret, options);
};