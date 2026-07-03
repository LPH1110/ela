import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AppError, ErrorCodes, asyncHandler } from '../utils/errors';
import { CryptoService } from '../services/crypto.service';
import { env } from '../config/env';
import { WebClient } from '@slack/web-api';
import { providerRegistry } from '../integrations/registry';
import jwt from 'jsonwebtoken';
import { deferredIntegrationQueue } from '../queues/deferred-integration.queue';

export class IntegrationController {
  
  static getCatalog = asyncHandler(async (req: Request, res: Response) => {
    // Return the integration catalog
    const catalog = {
      github: {
        id: "github",
        name: "GitHub",
        description: "Connect GitHub to automate organization invites and manage repository access.",
        authType: "credentials",
        docsUrl: "#github-docs",
        scopes: ["repo", "admin:org", "user"],
        fields: [
          { id: "pat", label: "Personal Access Token (PAT)", type: "password", placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx" }
        ]
      },
      slack: {
        id: "slack",
        name: "Slack Enterprise",
        description: "Integrate Slack to provision accounts and send onboarding welcome messages.",
        authType: "oauth",
        docsUrl: "#slack-docs"
      },
      google: {
        id: "google",
        name: "Google Workspace",
        description: "Automate Gmail, Google Drive, and organizational unit (OU) assignments.",
        authType: "oauth",
        docsUrl: "#google-docs"
      },
      jira: {
        id: "jira",
        name: "Jira Software",
        description: "Manage Jira project access and issue assignment upon onboarding.",
        authType: "credentials",
        docsUrl: "#jira-docs",
        fields: [
          { id: "domain", label: "Workspace URL", type: "url", placeholder: "https://your-company.atlassian.net" },
          { id: "email", label: "Admin Email", type: "text", placeholder: "admin@your-company.com" },
          { id: "api_token", label: "Jira API Token", type: "password", placeholder: "ATATT3xFfGF0..." }
        ]
      },
      zalo: {
        id: "zalo",
        name: "Zalo Official Account",
        description: "Connect Zalo ZNS to send automated notifications to employees via Zalo.",
        authType: "credentials",
        docsUrl: "#zalo-docs",
        fields: [
          { id: "oa_id", label: "Official Account ID", type: "text", placeholder: "1234567890" },
          { id: "access_token", label: "Zalo Access Token", type: "password", placeholder: "eyJhbGciOiJIUzI1NiIs..." }
        ]
      }
    };

    return res.status(200).json({ data: catalog });
  });

  static listIntegrations = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.orgId;
    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const integrations = await prisma.integration.findMany({
      where: { organizationId },
      include: { mappings: true }
    });

    // Don't send encrypted keys back to client
    const safeIntegrations = integrations.map(i => ({
      id: i.id,
      provider: i.provider,
      metadata: i.metadata,
      isActive: i.isActive,
      createdAt: i.createdAt,
      mappings: i.mappings
    }));

    return res.status(200).json({ data: safeIntegrations });
  });

  static disconnectIntegration = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = req.user?.orgId;

    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const integration = await prisma.integration.findUnique({
      where: { id, organizationId }
    });

    if (!integration) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Integration not found');
    }

    // Drain pending deferred jobs for this provider
    const waiting = await deferredIntegrationQueue.getJobs(['waiting', 'delayed']);
    for (const job of waiting) {
      if (job.data?.provider === integration.provider) {
        await job.remove();
      }
    }

    await prisma.integration.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Integration disconnected successfully' });
  });

  static syncIntegration = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = req.user?.orgId;

    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const integration = await prisma.integration.findUnique({
      where: { id, organizationId }
    });

    if (!integration) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Integration not found');
    }

    // Fetch all active employees
    const employees = await prisma.employee.findMany({
      where: { 
        organizationId,
        status: 'ACTIVE'
      }
    });

    let count = 0;
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      
      // Log that a sync is happening
      const syncJobLog = await prisma.jobLog.create({
        data: {
          employeeId: employee.id,
          action: 'IT_ONBOARDING',
          status: 'PROCESSING',
          message: `Manual sync triggered for ${integration.provider}`
        }
      });

      // Stagger the jobs to avoid hitting rate limits
      await deferredIntegrationQueue.add('deferred-integration', {
        employeeId: employee.id,
        organizationId,
        provider: integration.provider,
        jobLogId: syncJobLog.id
      }, {
        delay: i * 2000, // 2 seconds apart
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      });
      count++;
    }

    return res.status(200).json({ 
      message: `Sync started for ${count} active employees`,
      data: { count }
    });
  });

  static getProviderResources = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = req.user?.orgId;

    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const integration = await prisma.integration.findUnique({
      where: { id, organizationId }
    });

    if (!integration) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Integration not found');
    }

    const provider = providerRegistry.get(integration.provider);
    if (!provider) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Provider not registered');
    }

    const token = CryptoService.decrypt({
      encrypted: integration.encryptedKey,
      iv: integration.iv,
      authTag: integration.authTag
    });

    const resources = await provider.fetchResources(token);

    return res.status(200).json({ data: resources });
  });

  static addMapping = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const organizationId = req.user?.orgId;
    const { department, resourceId, resourceName, resourceType } = req.body;

    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }
    
    if (!department || !resourceId || !resourceName || !resourceType) {
      throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Missing mapping details');
    }

    const integration = await prisma.integration.findUnique({
      where: { id, organizationId }
    });

    if (!integration) {
      throw new AppError(404, ErrorCodes.NOT_FOUND, 'Integration not found');
    }

    try {
      const mapping = await prisma.integrationMapping.create({
        data: {
          integrationId: id,
          department,
          resourceId,
          resourceName,
          resourceType
        }
      });
      return res.status(201).json({ message: 'Mapping created', data: mapping });
    } catch (e: any) {
      if (e.code === 'P2002') {
         throw new AppError(409, ErrorCodes.VALIDATION_ERROR, 'Mapping already exists for this department and resource');
      }
      throw e;
    }
  });

  static removeMapping = asyncHandler(async (req: Request, res: Response) => {
    const { id, mappingId } = req.params;
    const organizationId = req.user?.orgId;

    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    // Verify mapping belongs to integration which belongs to org
    const mapping = await prisma.integrationMapping.findFirst({
      where: {
        id: mappingId,
        integrationId: id,
        integration: { organizationId }
      }
    });

    if (!mapping) {
       throw new AppError(404, ErrorCodes.NOT_FOUND, 'Mapping not found');
    }

    await prisma.integrationMapping.delete({ where: { id: mappingId } });

    return res.status(200).json({ message: 'Mapping removed' });
  });

  // --- SLACK OAUTH ---

  static slackInstall = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.user?.orgId;
    if (!organizationId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN_NO_ORG, 'Forbidden: No organization context');
    }

    const inviteLink = req.query.inviteLink as string;

    // State encodes the org context safely
    const state = jwt.sign({ orgId: organizationId, inviteLink }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    
    const clientId = env.SLACK_CLIENT_ID;
    const redirectUri = `${env.SERVER_URL}/api/integrations/slack/callback`;
    const scopes = 'channels:read,groups:read,chat:write,users:read,users:read.email,channels:manage,groups:write';

    const installUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
    
    // We return the URL so the frontend can redirect the user
    return res.status(200).json({ url: installUrl });
  });

  static slackCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;

    if (!code || !state) {
       return res.redirect(`${env.CLIENT_URL}/integrations?error=missing_params`);
    }

    let orgId: string;
    let inviteLink: string | undefined;
    try {
       const decoded = jwt.verify(state as string, env.JWT_ACCESS_SECRET) as { orgId: string, inviteLink?: string };
       orgId = decoded.orgId;
       inviteLink = decoded.inviteLink;
    } catch (e) {
       return res.redirect(`${env.CLIENT_URL}/integrations?error=invalid_state`);
    }

    try {
      const slack = new WebClient();
      const result = await slack.oauth.v2.access({
        client_id: env.SLACK_CLIENT_ID,
        client_secret: env.SLACK_CLIENT_SECRET,
        code: code as string,
        redirect_uri: `${env.SERVER_URL}/api/integrations/slack/callback`
      });

      if (!result.ok || !result.access_token) {
        throw new Error(result.error || 'Failed to get access token');
      }

      const authTest = await slack.auth.test({ token: result.access_token });
      const { encrypted, iv, authTag } = CryptoService.encrypt(result.access_token);

      const metadata = {
        teamId: result.team?.id,
        teamName: result.team?.name,
        teamUrl: authTest.url,
        inviteLink
      };

      await prisma.integration.upsert({
        where: { organizationId_provider: { organizationId: orgId, provider: 'SLACK' } },
        update: {
          encryptedKey: encrypted,
          iv,
          authTag,
          metadata,
          isActive: true
        },
        create: {
          organizationId: orgId,
          provider: 'SLACK',
          encryptedKey: encrypted,
          iv,
          authTag,
          metadata
        }
      });

      return res.redirect(`${env.CLIENT_URL}/integrations?success=slack`);
    } catch (error) {
      console.error('[IntegrationController] Slack OAuth error:', error);
      return res.redirect(`${env.CLIENT_URL}/integrations?error=oauth_failed`);
    }
  });

}
