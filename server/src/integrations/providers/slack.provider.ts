import { WebClient } from '@slack/web-api';
import { 
  IntegrationProvider, 
  LifecycleContext,
  IntegrationResult, 
  ProviderResource 
} from '../types';

export class SlackProvider implements IntegrationProvider {
  readonly name = 'SLACK';

  async onboard(ctx: LifecycleContext, token: string): Promise<IntegrationResult> {
    const slack = new WebClient(token);
    try {
      // 1. Look up user by email
      let userLookupResult;
      try {
        userLookupResult = await slack.users.lookupByEmail({ email: ctx.employee.personalEmail });
      } catch (err: any) {
        if (err.data?.error === 'users_not_found') {
          return {
            success: false,
            provider: this.name,
            message: `Employee has not joined the Slack workspace yet. Will retry automatically.`,
            retryable: true
          };
        }
        throw err;
      }
      
      if (!userLookupResult.ok || !userLookupResult.user?.id) {
        return {
          success: false,
          provider: this.name,
          message: `Could not find Slack user ID for email ${ctx.employee.personalEmail}.`,
          retryable: false
        };
      }
      const slackUserId = userLookupResult.user.id;

      // 2. Add to channels
      for (const mapping of ctx.mappings) {
        if (mapping.resourceType === 'channel') {
          try {
            await slack.conversations.invite({
              channel: mapping.resourceId,
              users: slackUserId
            });
          } catch (err: any) {
            // Ignore if user is already in channel
            if (err.data?.error !== 'already_in_channel') {
               console.error(`[SlackProvider] Error adding user to channel ${mapping.resourceName}:`, err);
               // We won't fail the whole onboarding if one channel fails, but we should log it
            }
          }
        }
      }

      // 3. Post a single welcome message
      if (ctx.mappings.length > 0) {
        // Try to find a general/announcements channel, otherwise fallback to the first mapped channel
        const welcomeChannel = ctx.mappings.find(m => 
          m.resourceName.toLowerCase() === '#announcements' || 
          m.resourceName.toLowerCase() === '#general'
        ) || ctx.mappings[0];

        try {
          await slack.chat.postMessage({
            channel: welcomeChannel.resourceId,
            text: `Welcome <@${slackUserId}> to the ${ctx.organization.name} team! 🎉`
          });
        } catch (err: any) {
          console.error(`[SlackProvider] Error posting welcome message to ${welcomeChannel.resourceName}:`, err);
        }
      }

      return {
        success: true,
        provider: this.name,
        message: 'Successfully invited user to Slack channels and posted welcome messages.',
        retryable: false
      };
    } catch (error: any) {
      console.error('[SlackProvider] Onboarding error:', error);
      return {
        success: false,
        provider: this.name,
        message: error.message || 'Unknown Slack error',
        retryable: true // Most network/API errors might be transient
      };
    }
  }

  async offboard(ctx: LifecycleContext, token: string): Promise<IntegrationResult> {
    const slack = new WebClient(token);
    try {
      // 1. Look up user by email
      let userLookupResult;
      try {
        userLookupResult = await slack.users.lookupByEmail({ email: ctx.employee.personalEmail });
      } catch (err: any) {
        if (err.data?.error === 'users_not_found') {
          return {
            success: true, // If they are not in Slack, offboarding is effectively successful
            provider: this.name,
            message: `User ${ctx.employee.personalEmail} not found in Slack. Nothing to do.`,
            retryable: false
          };
        }
        throw err;
      }
      
      if (!userLookupResult.ok || !userLookupResult.user?.id) {
        return {
          success: true, 
          provider: this.name,
          message: `Could not find Slack user ID for ${ctx.employee.personalEmail}.`,
          retryable: false
        };
      }
      const slackUserId = userLookupResult.user.id;

      // 2. Remove from channels
      for (const mapping of ctx.mappings) {
        if (mapping.resourceType === 'channel') {
          try {
            await slack.conversations.kick({
              channel: mapping.resourceId,
              user: slackUserId
            });
          } catch (err: any) {
             console.error(`[SlackProvider] Error kicking user from channel ${mapping.resourceName}:`, err);
          }
        }
      }

      return {
        success: true,
        provider: this.name,
        message: 'Successfully removed user from mapped Slack channels.',
        retryable: false
      };
    } catch (error: any) {
      console.error('[SlackProvider] Offboarding error:', error);
      return {
        success: false,
        provider: this.name,
        message: error.message || 'Unknown Slack error',
        retryable: true 
      };
    }
  }

  async validateConnection(token: string): Promise<boolean> {
    try {
      const slack = new WebClient(token);
      const res = await slack.auth.test();
      return res.ok;
    } catch (error) {
      return false;
    }
  }

  async fetchResources(token: string): Promise<ProviderResource[]> {
    try {
      const slack = new WebClient(token);
      // Fetch public and private channels where the bot is a member (or public ones)
      const res = await slack.conversations.list({
        types: 'public_channel,private_channel',
        exclude_archived: true,
        limit: 100
      });

      if (!res.ok || !res.channels) {
        return [];
      }

      return res.channels.map(c => ({
        id: c.id as string,
        name: c.name ? `#${c.name}` : 'Unknown',
        type: 'channel'
      }));
    } catch (error) {
      console.error('[SlackProvider] Error fetching resources:', error);
      return [];
    }
  }
}
