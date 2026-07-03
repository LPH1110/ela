import prisma from '../../config/prisma';
import { IntegrationService } from '../integration.service';
import { EmailService } from '../../services/email.service';
import { deferredIntegrationQueue } from '../../queues/deferred-integration.queue';

export class OnboardingOrchestrator {
  static async execute(
    employeeId: string,
    organizationId: string,
    invitedById?: string): Promise<void> {
    // 1. Create a job log for onboarding process
    const log = await prisma.jobLog.create({
      data: {
        employeeId,
        action: 'IT_ONBOARDING',
        status: 'PROCESSING',
        message: 'Starting IT onboarding sequence...'
      }
    });

    // 2. Run all integrations EXCEPT Slack for immediate execution
    const results = await IntegrationService.runPipeline({
      employeeId,
      organizationId,
      action: 'ONBOARD',
      excludeProviders: ['SLACK']
    });

    // 3. Update job log status based on integration results
    const allSucceeded = results.every(r => r.success);
    await prisma.jobLog.update({
      where: { id: log.id },
      data: {
        status: allSucceeded ? 'SUCCESS' : 'PARTIAL_FAILURE',
        message: allSucceeded
          ? 'All integrations completed successfully.'
          : `Partial failure: ${results
            .filter(r => !r.success)
            .map(r => r.provider)
            .join(', ')}`
      }
    });

    // 4. Update employee status
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { status: 'ACTIVE' },
      include: { organization: true }
    });

    // 5. Schedule deferred Slack onboarding if integration is active
    const slackIntegration = await prisma.integration.findUnique({
      where: {
        organizationId_provider: {
          organizationId: employee.organizationId,
          provider: 'SLACK'
        }
      }
    });

    let slackInviteLink: string | undefined = undefined;
    if (slackIntegration && slackIntegration.isActive) {
      if (slackIntegration.metadata) {
        const metadata = slackIntegration.metadata as any;
        if (metadata.inviteLink) {
          slackInviteLink = metadata.inviteLink;
        } else if (metadata.teamUrl) {
          slackInviteLink = metadata.teamUrl;
        }
      }

      await deferredIntegrationQueue.add('deferred-integration', {
        employeeId,
        organizationId,
        provider: 'SLACK'
      }, {
        delay: 24 * 60 * 60 * 1000, // 24 hours
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 24 * 60 * 60 * 1000
        }
      });
      console.log(`[OnboardingOrchestrator] Scheduled deferred SLACK onboarding for employee: ${employeeId}`);
    }

    // 6. Auto-invite HR employees to ELA platform
    let inviteToken: string | undefined = undefined;

    if (employee.department.toUpperCase() === 'HR' && invitedById) {
      try {
        const invitation = await prisma.invitation.create({
          data: {
            email: employee.personalEmail,
            organizationId,
            invitedById,
            role: 'MEMBER', // Give them MEMBER role on ELA platform by default
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        });
        inviteToken = invitation.token;
        console.log(`[OnboardingOrchestrator] Created ELA platform invitation for HR employee: ${employeeId}`);
      } catch (inviteErr) {
        console.error(`[OnboardingOrchestrator] Failed to create invitation for ${employee.personalEmail}`, inviteErr);
      }
    }

    // 7. Send welcome email
    if (employee.personalEmail) {
      try {
        await EmailService.sendOnboardingWelcome(
          employee.personalEmail,
          employee.fullName,
          employee.organization.name,
          slackInviteLink,
          inviteToken
        );
      } catch (emailErr) {
        console.error(`[OnboardingOrchestrator] Failed to send email to ${employee.personalEmail}`, emailErr);
      }
    }
  }
}
