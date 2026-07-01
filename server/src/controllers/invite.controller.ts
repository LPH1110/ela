import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { JwtService } from '../config/jwt';
import { AppError, ErrorCodes, asyncHandler } from '../utils/errors';
import { EmailService } from '../services/email.service';
import { UserRole } from '@prisma/client';

export class InviteController {
  
  static create = asyncHandler(async (req: Request, res: Response) => {
    const { email, role } = req.body;
    const organizationId = req.user?.orgId;
    const invitedById = req.user?.sub;

    if (!organizationId || !invitedById) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Not authorized to invite members to this organization');
    }

    if (!email) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Email is required');
    }

    // Verify org exists and get its name
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Organization not found');
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ 
        where: { email },
        include: { memberships: { where: { organizationId } } }
    });
    
    if (existingUser && existingUser.memberships.length > 0) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'User is already a member of this workspace');
    }

    // Create the invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        organizationId,
        invitedById,
        role: role === 'ADMIN' ? UserRole.ADMIN : UserRole.MEMBER,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      }
    });

    // Send email
    await EmailService.sendInvitation(email, org.name, invitation.token);

    return res.status(201).json({
      message: 'Invitation sent successfully',
      data: { id: invitation.id, email: invitation.email, role: invitation.role }
    });
  });

  static accept = asyncHandler(async (req: Request, res: Response) => {
    const { token, password, fullName } = req.body;
    
    if (!token) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Token is required');
    }

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) {
      throw new AppError(404, ErrorCodes.INVITE_INVALID, 'Invalid or expired invitation');
    }

    if (invitation.expiresAt < new Date() || invitation.status !== 'PENDING') {
      throw new AppError(400, ErrorCodes.INVITE_EXPIRED, 'Invitation has expired or already been accepted');
    }

    // Find if user already exists
    let user = await prisma.user.findUnique({ where: { email: invitation.email } });

    const result = await prisma.$transaction(async (tx) => {
      if (!user) {
        // If the user doesn't exist, require password and fullName to create account
        if (!password || !fullName) {
          throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Account does not exist. Please provide password and full name to complete registration.');
        }
        const passwordHash = await bcrypt.hash(password, 12);
        user = await tx.user.create({
          data: { email: invitation.email, passwordHash, fullName, isVerified: true }
        });
      }

      // Create membership
      const membership = await tx.membership.create({
        data: { userId: user.id, organizationId: invitation.organizationId, role: invitation.role }
      });

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' }
      });

      return { user, membership };
    });

    const { user: finalUser, membership } = result;

    // Automatically login the user
    const accessToken = JwtService.generateAccessToken(finalUser.id, membership.organizationId, membership.role);
    const refreshToken = JwtService.generateRefreshToken(finalUser.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: finalUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    res.cookie('ela_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: 'Invitation accepted successfully',
      accessToken,
      user: { id: finalUser.id, email: finalUser.email, fullName: finalUser.fullName, orgId: membership.organizationId, role: membership.role }
    });
  });
}
