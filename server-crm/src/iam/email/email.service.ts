import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Email service for sending emails using nodemailer
 */
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize transporter if not already initialized
   * Checks configuration only when needed
   */
  private getTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    const mailAppKey = this.configService.get<string>('MAIL_APP_KEY');
    const mailUser = this.configService.get<string>('MAIL_USER') || this.configService.get<string>('MAIL_FROM');
    
    if (!mailAppKey) {
      console.error('❌ MAIL_APP_KEY is not configured');
      throw new Error('MAIL_APP_KEY is not configured in environment variables');
    }

    if (!mailUser) {
      console.error('❌ MAIL_USER or MAIL_FROM is not configured');
      throw new Error('MAIL_USER or MAIL_FROM is not configured in environment variables');
    }

    console.log('📧 Initializing email transporter:', {
      service: 'gmail',
      user: mailUser,
      hasPassword: !!mailAppKey,
    });

    // Configure transporter (assuming Gmail App Password)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailAppKey,
      },
    });

    return this.transporter;
  }

  /**
   * Send password reset email with token link
   */
  async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<void> {
    try {
      const transporter = this.getTransporter();
      const fromEmail = this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER') || 'noreply@jenyclean.com';
      
      // Determine APP_URL based on environment
      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
      const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
      
      let appUrl: string;
      if (nodeEnv === 'production') {
        // Production: use domain from COOKIE_DOMAIN
        appUrl = cookieDomain ? `https://${cookieDomain}` : 'https:/cleanersin.store';
      } else {
        // Development: use APP_URL or default localhost
        appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      }
      
      const fullResetUrl = `${appUrl}/reset-password?token=${resetToken}`;

      console.log('📧 Attempting to send password reset email:', {
        to: email,
        from: fromEmail,
        url: fullResetUrl,
        environment: nodeEnv,
      });

      const html = this.getPasswordResetEmailTemplate(resetUrl || fullResetUrl);

      const info = await transporter.sendMail({
        from: `"Jeny Clean CRM" <${fromEmail}>`,
        to: email,
        subject: 'Password Reset Request - Jeny Clean CRM',
        html,
      });

      console.log('✅ Password reset email sent successfully:', {
        messageId: info.messageId,
        to: email,
        response: info.response,
      });
    } catch (error) {
      console.error('❌ Failed to send password reset email:', {
        error: error.message,
        stack: error.stack,
        to: email,
      });
      throw error;
    }
  }

  /**
   * Send invitation email with token link
   */
  async sendInvitationEmail(email: string, inviteToken: string, inviteUrl: string): Promise<void> {
    try {
      const transporter = this.getTransporter();
      const fromEmail = this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER') || 'noreply@jenyclean.com';
      
      // Determine APP_URL based on environment
      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
      const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
      
      let appUrl: string;
      if (nodeEnv === 'production') {
        // Production: use domain from COOKIE_DOMAIN
        appUrl = cookieDomain ? `https://${cookieDomain}` : 'https://cleanersin.store';
      } else {
        // Development: use APP_URL or default localhost
        appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      }
      
      const fullInviteUrl = `${appUrl}/sign-up?token=${inviteToken}`;

      console.log('📧 Attempting to send invitation email:', {
        to: email,
        from: fromEmail,
        url: fullInviteUrl,
        environment: nodeEnv,
      });

      const html = this.getInvitationEmailTemplate(inviteUrl || fullInviteUrl);

      const info = await transporter.sendMail({
        from: `"Jeny Clean CRM" <${fromEmail}>`,
        to: email,
        subject: 'Invitation to Join - Jeny Clean CRM',
        html,
      });

      console.log('✅ Invitation email sent successfully:', {
        messageId: info.messageId,
        to: email,
        response: info.response,
      });
    } catch (error) {
      console.error('❌ Failed to send invitation email:', {
        error: error.message,
        stack: error.stack,
        to: email,
      });
      throw error;
    }
  }

  /**
   * Get HTML template for invitation email
   */
  private getInvitationEmailTemplate(inviteUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Join</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">You're Invited!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                You have been invited to join Jeny Clean CRM. Click the button below to complete your registration and create your account.
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                This invitation link will expire in 2 hours.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Complete Registration
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                ${inviteUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Jeny Clean CRM. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Send invitation email for client portal with token link
   */
  async sendClientInvitationEmail(email: string, inviteToken: string, inviteUrl: string): Promise<void> {
    try {
      const transporter = this.getTransporter();
      const fromEmail = this.configService.get<string>('MAIL_FROM') || this.configService.get<string>('MAIL_USER') || 'noreply@jenyclean.com';
      
      // Determine CLIENT_PORTAL_URL based on environment
      const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
      const clientPortalUrl = this.configService.get<string>('CLIENT_PORTAL_URL');
      
      let portalUrl: string;
      if (nodeEnv === 'production') {
        // Production: use CLIENT_PORTAL_URL or default
        portalUrl = clientPortalUrl || 'https://clientportal.store';
      } else {
        // Development: use CLIENT_PORTAL_URL or default localhost
        portalUrl = clientPortalUrl || 'http://localhost:clientportal';
      }
      
      const fullInviteUrl = `${portalUrl}/sign-up?token=${inviteToken}`;

      console.log('📧 Attempting to send client invitation email:', {
        to: email,
        from: fromEmail,
        url: fullInviteUrl,
        environment: nodeEnv,
      });

      const html = this.getClientInvitationEmailTemplate(inviteUrl || fullInviteUrl);

      const info = await transporter.sendMail({
        from: `"Jeny Clean" <${fromEmail}>`,
        to: email,
        subject: 'Invitation to Join - Jeny Clean Client Portal',
        html,
      });

      console.log('✅ Client invitation email sent successfully:', {
        messageId: info.messageId,
        to: email,
        response: info.response,
      });
    } catch (error) {
      console.error('❌ Failed to send client invitation email:', {
        error: error.message,
        stack: error.stack,
        to: email,
      });
      throw error;
    }
  }

  /**
   * Get HTML template for client invitation email
   */
  private getClientInvitationEmailTemplate(inviteUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to Join</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">You're Invited!</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                You have been invited to join Jeny Clean Client Portal. Click the button below to complete your registration and create your account.
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                This invitation link will expire in 2 hours.
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Complete Registration
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                ${inviteUrl}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Jeny Clean. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Get HTML template for password reset email
   */
  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Password Reset Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your Jeny Clean CRM account. If you didn't make this request, you can safely ignore this email.
              </p>
              <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                To reset your password, click the button below:
              </p>
              
              <!-- Button -->
              <table role="presentation" style="width: 100%; margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 10px 0 0; color: #667eea; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="margin: 30px 0 0; color: #999999; font-size: 12px; line-height: 1.6;">
                This link will expire in 1 hour for security reasons.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Jeny Clean CRM. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                If you didn't request this password reset, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}

