import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { EmailService } from '../services/email.service';
import { UserRole } from '@prisma/client';
import { AppError, ErrorCodes, asyncHandler } from '../utils/errors';
import { JwtService } from '../config/jwt';

export class OrgController {

  static create = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    const userId = req.user?.sub;

    if (!name || !userId) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Missing organization name');
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({ data: { name, slug } });
      const membership = await tx.membership.create({
        data: { userId, organizationId: org.id, role: UserRole.OWNER }
      });
      return { org, membership };
    });

    // Generate new access token with the org context
    const accessToken = JwtService.generateAccessToken(userId, result.org.id, UserRole.OWNER);

    // Retrieve user info
    const userRecord = await prisma.user.findUnique({ where: { id: userId } });

    return res.status(201).json({
      message: 'Organization created successfully',
      accessToken,
      user: {
        id: userId,
        email: userRecord?.email,
        fullName: userRecord?.fullName,
        orgId: result.org.id,
        role: UserRole.OWNER
      },
      org: result.org
    });
  });

  static invite = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const { email, role } = req.body;
    const invitedById = req.user?.sub;

    if (!email || !orgId || !invitedById) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Missing required fields');
    }

    // Verify org exists
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Organization not found');
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMembership = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: existingUser.id, organizationId: orgId } }
      });
      if (existingMembership) {
        throw new AppError(409, ErrorCodes.DUPLICATE_MEMBER, 'User is already a member of this organization');
      }
    }

    // Create invitation valid for 48 hours
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const invite = await prisma.invitation.create({
      data: { email, organizationId: orgId, role: role || UserRole.MEMBER, invitedById, expiresAt }
    });

    // Send email
    await EmailService.sendInvitation(email, org.name, invite.token);

    return res.status(201).json({ message: 'Invitation sent successfully', inviteToken: invite.token });
  });

  static listMembers = asyncHandler(async (req: Request, res: Response) => {
    const { orgId } = req.params;
    const members = await prisma.membership.findMany({
      where: { organizationId: orgId },
      include: { user: { select: { id: true, email: true, fullName: true, avatarUrl: true } } }
    });

    return res.status(200).json({ data: members });
  });

  static getMetrics = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId!;
    
    const [totalEmployees, pendingOnboarding, activeIntegrations, recentOffboards] = await Promise.all([
      prisma.employee.count({ where: { organizationId: orgId } }),
      prisma.employee.count({ where: { organizationId: orgId, status: 'ONBOARDING' } }),
      prisma.integration.count({ where: { organizationId: orgId, isActive: true } }),
      prisma.employee.count({
        where: {
          organizationId: orgId,
          status: 'OFFBOARDED',
          updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    return res.status(200).json({
      data: {
        totalEmployees,
        pendingOnboarding,
        activeIntegrations,
        recentOffboards
      }
    });
  });

  static getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const departments = [
      "Engineering",
      "Product",
      "Design",
      "Marketing",
      "Sales",
      "HR",
      "Finance",
      "Operations"
    ];
    
    return res.status(200).json({ data: departments });
  });

  static getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.user!.orgId!;
    const limit = parseInt(req.query.limit as string) || 50;

    const logs = await prisma.integrationLog.findMany({
      where: { employee: { organizationId: orgId } },
      include: {
        employee: { select: { id: true, fullName: true, personalEmail: true, companyEmail: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return res.status(200).json({ data: logs });
  });
}
