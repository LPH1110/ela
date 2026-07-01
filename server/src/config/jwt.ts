import jwt from 'jsonwebtoken';
import { env } from './env';

export interface TokenPayload {
  sub: string;
  orgId?: string;
  role?: string;
}

export class JwtService {
  static generateAccessToken(userId: string, orgId?: string, role?: string): string {
    const payload: TokenPayload = { sub: userId, orgId, role };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  }

  static generateRefreshToken(userId: string): string {
    const payload = { sub: userId };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  }

  static verifyRefreshToken(token: string): { sub: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
  }
}
