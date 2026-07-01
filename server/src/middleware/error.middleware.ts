import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '../utils/errors';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log full error internally for debugging
  console.error('[Error Handler]:', err);

  // 1. Handle our custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // 2. Handle Prisma specific errors
  if (err.code && err.code.startsWith('P')) {
    // Unique constraint violation (e.g., email already registered)
    if (err.code === 'P2002') {
      const target = err.meta?.target as string[] | undefined;
      const field = target ? target.join(', ') : 'field';
      return res.status(409).json({
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: `A record with this ${field} already exists.`,
        },
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: err.meta?.cause || 'Requested record was not found.',
        },
      });
    }
  }

  // 3. Handle JWT errors
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: ErrorCodes.AUTH_TOKEN_EXPIRED,
        message: 'Session expired. Please sign in again.',
      },
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: ErrorCodes.AUTH_TOKEN_INVALID,
        message: 'Invalid authentication token.',
      },
    });
  }

  // 4. Handle Express body-parser SyntaxError
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    return res.status(400).json({
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Invalid JSON request payload.',
      },
    });
  }

  // 5. Default internal server error
  return res.status(500).json({
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'Something went wrong. Please try again later.',
    },
  });
};
