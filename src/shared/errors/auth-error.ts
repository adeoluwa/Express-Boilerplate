import { ApplicationError } from "./application-error";

export class AuthenticationError extends ApplicationError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, unknown>
  ) {
    super({
      message,
      code: "AUTHENTICATION_ERROR",
      messageCode: code,
      metadata,
    });
  }
}

export class AuthorizationError extends ApplicationError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, unknown>
  ) {
    super({ message, code: "PERMISSION_DENIED", messageCode: code, metadata });
  }
}
