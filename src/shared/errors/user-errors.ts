import { ApplicationError } from "./application-error";

export class NotFoundError extends ApplicationError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, unknown>
  ) {
    super({ message, code: "NOT_FOUND", messageCode: code, metadata });
  }
}

export class ConflictError extends ApplicationError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, unknown>
  ) {
    super({ message, code: "CONFLICT", messageCode: code, metadata });
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(
    message: string,
    code?: string,
    metadata?: Record<string, unknown>
  ) {
    super({ message, code: "FORBIDDEN", messageCode: code, metadata });
  }
}

export class MaxQueryReached extends ApplicationError {
  constructor(
    message: string,
    limiterRes?: {
      remainingPoints: number;
      msBeforeNext: number;
      consumedPoints: number;
      isFirstInDuration: boolean;
    }
  ) {
    super({
      message,
      code: "MAX_QUERY_COMPLEXITY_EXCEEDED",
      attachHeaders: limiterRes
        ? { "Retry-After": String(limiterRes.msBeforeNext / 1000) }
        : undefined,
    });
  }
}

export class BadRequestError extends ApplicationError {
  errors: unknown[];

  constructor(
    message: string,
    errors: unknown[],
    code?: string,
    metadata?: Record<string, unknown>
  ) {
    super({ message, code: "BAD_REQUEST", messageCode: code, metadata });

    this.errors = errors;
  }
}
