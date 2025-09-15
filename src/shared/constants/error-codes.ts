export const errorCodes = {
   /** The maximum query complexity has been exceeded, 429 */
  MAX_QUERY_COMPLEXITY_EXCEEDED: 'MAX_QUERY_COMPLEXITY_EXCEEDED',
  /** The resource was not found */
  NOT_FOUND: 'NOT_FOUND',
  /** The requested operation was not successful */
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  /** The authentication was not successful */
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  /** Not enough permission. */
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  /** Can not perform operation because of incomplete requirements. */
  FORBIDDEN: 'FORBIDDEN',
  /** Invalid user input */
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  /** An error occurred before your server could attempt to parse operation */
  BAD_REQUEST: 'BAD_REQUEST',
  /** An error occurred before your server could attempt to parse operation */
  CONFLICT: 'CONFLICT',
  /** An unspecified error occurred. */
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;