import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import { logger } from "@shared/logger";
import { ServerConfig } from "@core/config/server";
import { AuthenticationError } from "@shared/errors";

interface TokenPayload {
  id?: string;
  email?: string;
  [key: string]: any;
}

const DEFAULT_EXPIRES_IN: string = "1h";

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, ServerConfig.SALT_ROUNDS);
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (
  payload: TokenPayload,
  options: {
    secret?: string;
    expiresIn?: string | number;
  } = {}
): string => {
  const { secret = ServerConfig.JWT_SECRET, expiresIn = DEFAULT_EXPIRES_IN } =
    options;

  if (!secret) throw new AuthenticationError("JWT Secret is not defined");

  try {
    const SignOptions: SignOptions = expiresIn
      ? { expiresIn: expiresIn as SignOptions["expiresIn"] }
      : {};

    const token = jwt.sign(payload, secret, SignOptions);

    return token;
  } catch (error) {
    const err = error as Error;
    logger.error(
      { message: err.message, stack: err.stack, cause: err.cause },
      "Error generating token"
    );

    throw new AuthenticationError("Error generating token");
  }
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  try {
    const decodedToken = jwt.verify(token, ServerConfig.JWT_SECRET);

    if (typeof decodedToken === "object") {
      return decodedToken;
    }

    throw new AuthenticationError("Invalid token payload, expected an object");
  } catch (error) {
    const err = error as Error;
    logger.error(
      { message: err.message, stack: err.stack, cause: err.cause },
      "Error verifying token"
    );

    throw new AuthenticationError("Invalid or expired token");
  }
};

export const generateExpire = (duration: number = 14) => {
  return new Date(Date.now() + duration * 60 * 1000);
};

export const invalidateToken = async (token: string) => {
  return !jwt.verify(token, ServerConfig.JWT_SECRET);
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
