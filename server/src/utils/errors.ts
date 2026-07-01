export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_EMAIL_EXISTS: 'AUTH_EMAIL_EXISTS',
  AUTH_NO_TOKEN: 'AUTH_NO_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  FORBIDDEN_NO_ORG: 'FORBIDDEN_NO_ORG',
  FORBIDDEN_ROLE: 'FORBIDDEN_ROLE',
  NOT_FOUND: 'NOT_FOUND',
  INVITE_EXPIRED: 'INVITE_EXPIRED',
  INVITE_INVALID: 'INVITE_INVALID',
  DUPLICATE_MEMBER: 'DUPLICATE_MEMBER',
  EMPLOYEE_ALREADY_OFFBOARDED: 'EMPLOYEE_ALREADY_OFFBOARDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

// Async helper to wrap async routes and catch errors automatically
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};
