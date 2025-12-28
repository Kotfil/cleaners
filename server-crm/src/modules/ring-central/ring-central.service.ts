import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as jwt from 'jsonwebtoken';

/**
 * RingCentral SMS service using JWT auth flow
 */
@Injectable()
export class RingCentralService {
  private readonly logger = new Logger(RingCentralService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly privateKey: string;
  private readonly jwtToken: string;
  private readonly apiServerUrl: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.clientId = this.configService.get<string>('RING_CENTRAL_CLIENT_ID') || '';
    this.clientSecret = this.configService.get<string>('RING_CENTRAL_CLIENT_SECRET') || '';
    // Support ready JWT token from RingCentral (preferred method)
    this.jwtToken = this.configService.get<string>('RING_CENTRAL_JWT_TOKEN') || '';
    // Handle multi-line private key (replace \n with actual newlines) - fallback method
    const privateKeyRaw = this.configService.get<string>('RING_CENTRAL_PRIVATE_KEY') || '';
    this.privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    this.apiServerUrl = this.configService.get<string>('RING_CENTRAL_API_SERVER_URL') || 'https://platform.ringcentral.com';
    
    // Debug: проверяем загрузку переменных окружения
    const envVars = {
      RING_CENTRAL_CLIENT_ID: process.env.RING_CENTRAL_CLIENT_ID ? '✓' : '✗',
      RING_CENTRAL_CLIENT_SECRET: process.env.RING_CENTRAL_CLIENT_SECRET ? '✓' : '✗',
      RING_CENTRAL_JWT_TOKEN: process.env.RING_CENTRAL_JWT_TOKEN ? '✓' : '✗',
      RING_CENTRAL_PRIVATE_KEY: process.env.RING_CENTRAL_PRIVATE_KEY ? '✓' : '✗',
      RING_CENTRAL_FROM_PHONE_NUMBER: process.env.RING_CENTRAL_FROM_PHONE_NUMBER ? '✓' : '✗',
    };
    this.logger.debug('Environment variables check:', envVars);
    
    // Log configuration status (without sensitive data)
    this.logger.log(`RingCentral configured: Client ID: ${this.clientId ? '✓' : '✗'}, Secret: ${this.clientSecret ? '✓' : '✗'}, JWT Token: ${this.jwtToken ? '✓' : '✗'}, Private Key: ${this.privateKey ? '✓' : '✗'}`);
  }

  /**
   * Generate JWT token for RingCentral authentication
   */
  private generateJwt(): string {
    if (!this.privateKey) {
      throw new Error('RingCentral private key is not configured');
    }

    const now = Math.floor(Date.now() / 1000);
    const extensionId = this.configService.get<string>('RING_CENTRAL_EXTENSION_ID');
    const payload: any = {
      iss: this.clientId,
      aud: this.apiServerUrl,
      exp: now + 3600, // Token expires in 1 hour
      jti: `${this.clientId}-${now}`,
    };
    
    // Extension ID is optional for JWT auth
    if (extensionId) {
      payload.sub = extensionId;
    }

    try {
      // Validate private key format
      if (!this.privateKey.includes('BEGIN') || !this.privateKey.includes('END')) {
        throw new Error('Private key format is invalid. Must include BEGIN and END markers.');
      }
      
      return jwt.sign(payload, this.privateKey, { algorithm: 'RS256' });
    } catch (error: any) {
      this.logger.error('Failed to generate JWT', error.message || error);
      throw new Error(`Failed to generate JWT token: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Exchange JWT for access token
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('RingCentral credentials are not configured');
    }

    // Use ready JWT token if available (RingCentral approach - preferred)
    let jwtToken: string;
    if (this.jwtToken && this.jwtToken.trim().length > 0) {
      jwtToken = this.jwtToken.trim();
      this.logger.log('Using ready JWT token from RingCentral');
    } else if (this.privateKey && this.privateKey.trim().length > 0) {
      // Generate JWT from private key (traditional approach - fallback)
      jwtToken = this.generateJwt();
      this.logger.log('Generated JWT token from private key');
    } else {
      this.logger.error(`JWT Token configured: ${!!this.jwtToken}, Private Key configured: ${!!this.privateKey}`);
      throw new Error('Either RING_CENTRAL_JWT_TOKEN or RING_CENTRAL_PRIVATE_KEY must be configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiServerUrl}/restapi/oauth/token`,
          new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwtToken,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            auth: {
              username: this.clientId,
              password: this.clientSecret,
            },
          },
        ),
      );

      const accessToken = response.data.access_token;
      if (!accessToken) {
        throw new Error('Access token not received from RingCentral');
      }
      
      this.accessToken = accessToken;
      const expiresIn = response.data.expires_in || 3600;
      this.tokenExpiresAt = Date.now() + (expiresIn - 60) * 1000; // Refresh 1 minute before expiry

      this.logger.log('Successfully obtained RingCentral access token');
      return accessToken;
    } catch (error: any) {
      this.logger.error('Failed to obtain access token', error.response?.data || error.message);
      throw new Error(`Failed to obtain RingCentral access token: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Test configuration and get access token
   */
  async testConfiguration(): Promise<{ success: boolean; message?: string; error?: string; hasAccessToken?: boolean }> {
    try {
      // Check if credentials are configured
      if (!this.clientId || !this.clientSecret) {
        return {
          success: false,
          error: 'Client ID or Client Secret is not configured',
        };
      }

      // Check if JWT token or private key is configured
      if (!this.jwtToken && !this.privateKey) {
        return {
          success: false,
          error: 'Either RING_CENTRAL_JWT_TOKEN or RING_CENTRAL_PRIVATE_KEY must be configured',
        };
      }

      // Try to validate JWT token or generate from private key
      try {
        if (this.jwtToken) {
          this.logger.log('JWT token is configured and ready to use');
        } else if (this.privateKey) {
          const jwtToken = this.generateJwt();
          this.logger.log('JWT token generated successfully from private key');
        }
      } catch (error: any) {
        return {
          success: false,
          error: `Failed to prepare JWT: ${error.message}`,
        };
      }

      // Try to get access token
      try {
        const accessToken = await this.getAccessToken();
        return {
          success: true,
          message: 'Configuration is valid. Access token obtained successfully.',
          hasAccessToken: !!accessToken,
        };
      } catch (error: any) {
        return {
          success: false,
          error: `Failed to obtain access token: ${error.message}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Send SMS via RingCentral API
   */
  async sendSms(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!to || !text) {
      return {
        success: false,
        error: 'Phone number and text are required',
      };
    }

    // Phone number validation - E.164 format for USA: +1 + exactly 10 digits
    const cleanedTo = to.replace(/\s/g, '');
    const phoneRegex = /^\+1\d{10}$/;
    if (!phoneRegex.test(cleanedTo)) {
      this.logger.warn(`Invalid phone number format: ${to} (cleaned: ${cleanedTo})`);
      return {
        success: false,
        error: 'Phone number must be in E.164 format: +1XXXXXXXXXX (10 digits after +1)',
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      // Get sender phone number from config (optional - RingCentral may use account default)
      const fromPhoneNumber = this.configService.get<string>('RING_CENTRAL_FROM_PHONE_NUMBER');
      
      const requestBody: any = {
        to: [{ phoneNumber: to }],
        text: text,
      };
      
      // Add 'from' field only if phone number is configured
      // If not specified, RingCentral should use account default number
      if (fromPhoneNumber && fromPhoneNumber.trim().length > 0) {
        requestBody.from = { phoneNumber: fromPhoneNumber.trim() };
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiServerUrl}/restapi/v1.0/account/~/extension/~/sms`,
          requestBody,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return {
        success: true,
        messageId: response.data?.id || `sms-${Date.now()}`,
      };
    } catch (error: any) {
      this.logger.error('Failed to send SMS', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to send SMS',
      };
    }
  }
}

