import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { JwtService } from '../config/jwt';
import { User, UserRole } from '@prisma/client';
import { AppError, ErrorCodes, asyncHandler } from '../utils/errors';

const REFRESH_COOKIE_NAME = 'ela_refresh_token';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export class AuthController {
  
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName, orgName } = req.body;

    if (!email || !password || !fullName) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Missing required fields');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(409, ErrorCodes.AUTH_EMAIL_EXISTS, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let user;
    let org;
    let role;

    if (orgName) {
      // 1-step registration (backward compatible/creates user + org at once)
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { email, passwordHash, fullName }
        });

        const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
        const newOrg = await tx.organization.create({
          data: { name: orgName, slug }
        });

        await tx.membership.create({
          data: { userId: newUser.id, organizationId: newOrg.id, role: UserRole.OWNER }
        });

        return { newUser, newOrg };
      });
      user = result.newUser;
      org = result.newOrg;
      role = UserRole.OWNER;
    } else {
      // 2-step registration (only create user)
      user = await prisma.user.create({
        data: { email, passwordHash, fullName }
      });
    }

    const accessToken = JwtService.generateAccessToken(user.id, org?.id, role);
    const refreshToken = JwtService.generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
    
    return res.status(201).json({
      message: 'Registration successful',
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, orgId: org?.id, role }
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Missing email or password');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { memberships: true }
    });

    if (!user || !user.passwordHash) {
      throw new AppError(401, ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Invalid credentials');
    }

    // Default to the first membership org for the access token
    const membership = user.memberships[0];
    const orgId = membership?.organizationId;
    const role = membership?.role;

    const accessToken = JwtService.generateAccessToken(user.id, orgId, role);
    const refreshToken = JwtService.generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken,
      user: { id: user.id, email: user.email, fullName: user.fullName, orgId, role }
    });
  });

  static googleCallback = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as import('@prisma/client').User;
    if (!user) {
      throw new AppError(401, ErrorCodes.AUTH_INVALID_CREDENTIALS, 'OAuth authentication failed');
    }
    
    // If the user has memberships, grab the first one
    const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
    const membership = memberships[0];
    const orgId = membership?.organizationId;
    const role = membership?.role;

    const accessToken = JwtService.generateAccessToken(user.id, orgId, role);
    const refreshToken = JwtService.generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);

    // Redirect back to frontend
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw new AppError(401, ErrorCodes.AUTH_NO_TOKEN, 'No refresh token provided');
    }

    // Verify token in DB to ensure it hasn't been revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { memberships: true } } }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      res.clearCookie(REFRESH_COOKIE_NAME);
      throw new AppError(401, ErrorCodes.AUTH_TOKEN_EXPIRED, 'Refresh token invalid or expired');
    }

    const decoded = JwtService.verifyRefreshToken(refreshToken);
    if (decoded.sub !== storedToken.userId) {
      throw new AppError(401, ErrorCodes.AUTH_TOKEN_INVALID, 'Invalid token payload');
    }

    const membership = storedToken.user.memberships[0];
    const accessToken = JwtService.generateAccessToken(storedToken.userId, membership?.organizationId, membership?.role);

    return res.status(200).json({ accessToken });
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies[REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    // Must pass matching options (httpOnly, secure, sameSite, path) for the browser to actually delete the cookie
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError(401, ErrorCodes.AUTH_NO_TOKEN, 'Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { memberships: { include: { organization: true } } }
    });

    if (!user) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'User not found');
    }

    // Include orgId and role from the first membership if they exist
    const membership = user.memberships[0];

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        orgId: membership?.organizationId,
        role: membership?.role,
      },
      memberships: user.memberships.map(m => ({
        role: m.role,
        organization: { id: m.organization.id, name: m.organization.name }
      }))
    });
  });
}
