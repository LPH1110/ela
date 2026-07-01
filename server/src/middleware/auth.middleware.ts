import { Request, Response, NextFunction } from 'express';
import { JwtService, TokenPayload } from '../config/jwt';
import { User as PrismaUser, UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User extends TokenPayload, Partial<PrismaUser> {}
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtService.verifyAccessToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Forbidden: Role not assigned' });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

export const requireOrg = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.orgId) {
    return res.status(403).json({ error: 'Forbidden: Not associated with an organization' });
  }
  next();
};
