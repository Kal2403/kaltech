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
    expiresIn: (process.env.JWT_EXPIRES_IN?.trim() || "7d") as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, jwtSecret as Secret, options);
};
