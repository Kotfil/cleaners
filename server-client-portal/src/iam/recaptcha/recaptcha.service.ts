import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface RecaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaService {
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY') || '';
    
    if (!this.secretKey) {
      console.warn('⚠️ RECAPTCHA_SECRET_KEY not set in environment variables');
    }
  }

  async verifyCaptcha(token: string, remoteip?: string): Promise<boolean> {
    if (!this.secretKey) {
      console.warn('⚠️ reCAPTCHA verification skipped: secret key not configured');
      return true; // В dev режиме пропускаем проверку если ключ не установлен
    }

    if (!token) {
      throw new BadRequestException('Captcha token is required');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<RecaptchaVerifyResponse>(
          this.verifyUrl,
          new URLSearchParams({
            secret: this.secretKey,
            response: token,
            ...(remoteip && { remoteip }),
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const { success, 'error-codes': errorCodes } = response.data;

      if (!success) {
        console.error('❌ reCAPTCHA verification failed:', errorCodes);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error verifying reCAPTCHA:', error);
      throw new BadRequestException('Failed to verify captcha');
    }
  }
}

