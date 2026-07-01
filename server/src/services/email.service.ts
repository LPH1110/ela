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
  static async sendOnboardingWelcome(email: string, fullName: string, orgName: string) {
    const loginLink = `${env.CLIENT_URL}/login`;
    
    const mailOptions = {
      from: '"ELA Platform" <noreply@ela-platform.com>',
      to: email,
      subject: `Welcome to ${orgName}! Your accounts are ready`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the team, ${fullName}!</h2>
          <p>We are excited to have you join <strong>${orgName}</strong>.</p>
          <p>Your IT onboarding sequence has completed successfully. Your accounts for our internal tools (like Google Workspace, Slack, Jira, etc.) have been provisioned.</p>
          <p>Please check your personal email or talk to your manager for your temporary passwords.</p>
          <p>If you have been granted access to the ELA platform itself, you can log in below:</p>
          <a href="${loginLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #10b981; color: #fff; text-decoration: none; border-radius: 5px;">
            Log In to ELA
          </a>
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
