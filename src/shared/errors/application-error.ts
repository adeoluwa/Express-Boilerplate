import {errorCodes } from "@shared/constants/error-codes";

export class ApplicationError extends Error {
  /**
   * Constant HTTP error codes
   */
  code: keyof typeof errorCodes;
  /**
   * Optional message code to help client understand the error
   */
  messageCode: string;
  /**
   * Optional headers to attach to the response
   */
  attachHeaders?: Record<string, string>;
  /**
   * Optional extra metadata
   */
  metadata?: Record<string, unknown>;

  constructor(error: {
    message: string;
    code: keyof typeof errorCodes;
    attachHeaders?: Record<string, string>;
    messageCode?: string;
    metadata?: Record<string, unknown>;
  }) {
    super(error.message);

    this.name = 'ApplicationError';
    this.code = error.code;
    this.messageCode = error.messageCode || String(error.code);
    this.attachHeaders = error.attachHeaders;
    this.metadata = error.metadata;
  }

  get statusCode(): number {
    switch (this.code) {
      case 'BAD_REQUEST':
      case 'BAD_USER_INPUT':
        return 400;
      case 'AUTHENTICATION_ERROR':
        return 401;
      case 'PERMISSION_DENIED':
      case 'FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      case 'CONFLICT':
        return 409;
      case 'MAX_QUERY_COMPLEXITY_EXCEEDED':
        return 429;
      case 'SERVICE_UNAVAILABLE':
        return 503;
      case 'INTERNAL_SERVER_ERROR':
      default:
        return 500;
    }
  }
}