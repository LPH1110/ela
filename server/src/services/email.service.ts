import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendInvitation(email: string, orgName: string, inviteToken: string) {
    const inviteLink = `${env.CLIENT_URL}/login?inviteToken=${inviteToken}`;

    const mailOptions = {
      from: '"ELA Platform" <noreply@ela-platform.com>',
      to: email,
      subject: `You have been invited to join ${orgName} on ELA`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Join your team on ELA</h2>
          <p>You have been invited to join the <strong>${orgName}</strong> workspace.</p>
          <p>Click the button below to accept the invitation and set up your account:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #0066cc; color: #fff; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
          <p>Or copy this link: <br/> <a href="${inviteLink}">${inviteLink}</a></p>
          <p>This link will expire in 48 hours.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Invitation sent to ${email}`);
    } catch (error) {
      console.error('[EmailService] Failed to send invitation email:', error);
      throw new Error('Failed to send email');
    }
  }
  static async sendOnboardingWelcome(
    email: string,
    fullName: string,
    orgName: string,
    slackInviteLink?: string,
    inviteToken?: string
  ) {

    let slackHtml = '';
    if (slackInviteLink) {
      slackHtml = `
          <div style="margin: 24px 0; padding: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #0f172a;">📱 Action Required: Join Slack</h3>
            <p style="color: #475569; margin-bottom: 16px;">
              To automatically be added to your team's communication channels, you must join our Slack workspace using your new company email.
            </p>
            <a href="${slackInviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4a154b; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">
              Join Company Slack
            </a>
          </div>
      `;
    }

    const mailOptions = {
      from: '"ELA Platform" <noreply@ela-platform.com>',
      to: email,
      subject: `Welcome to ${orgName}! Your accounts are ready`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the team, ${fullName}!</h2>
          <p>We are excited to have you join <strong>${orgName}</strong>.</p>
          <p>Your IT onboarding sequence has completed successfully. Your accounts for our internal tools have been provisioned.</p>
          
          ${slackHtml}

          <p>Please check your personal email or talk to your manager for your temporary passwords.</p>
          
          ${inviteToken ? `
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <h3 style="margin-top: 0; color: #0f172a;">👥 ELA Platform Access</h3>
              <p style="color: #475569; margin-bottom: 16px;">
                As a member of the HR team, you have been granted access to the ELA platform to help manage the employee lifecycle.
              </p>
              <a href="${env.CLIENT_URL}/login?inviteToken=${inviteToken}" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Accept Invitation & Log In
              </a>
            </div>
          ` : ''}
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Onboarding welcome sent to ${email}`);
    } catch (error) {
      console.error('[EmailService] Failed to send onboarding welcome email:', error);
      throw new Error('Failed to send email');
    }
  }
}
