import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthenticationService } from './authentication.service';
import { SignInDto } from '../dto/sign-in.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Auth } from '../decorators/auth.decorator';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { AuthTypeEnum } from '../enums/auth-type.enum';
import { AuthenticationGuard } from '../guards/authentication.guard';

/**
 * Authentication controller for client portal
 * Read-only operations - uses shared database from server-crm
 */
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Auth(AuthTypeEnum.None)
  @Throttle({ default: { limit: 15, ttl: 60000 } }) // 15 requests per minute for sign-in
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Получаем IP адрес клиента
    const remoteip = request.ip || request.headers['x-forwarded-for']?.toString() || undefined;
    try {
      const result = await this.authService.signIn(signInDto, remoteip);
      const { accessToken, refreshToken } = result;
    
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieDomain = isProduction ? process.env.COOKIE_DOMAIN?.replace(/^\.+/, '') : undefined;
      response.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: isProduction ? 'none' : 'lax', // 'lax' для localhost, 'none' для HTTPS cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/', // Явно указываем path
        domain: cookieDomain, // Из env или по умолчанию для dev/prod (без точки для точного совпадения)
      });
      
      console.log('✅ Cookie set with domain:', cookieDomain || 'default (no domain)', 'raw:');

      // Возвращаем accessToken и информацию о капче
      return {
        accessToken,
        requiresCaptcha: result.requiresCaptcha || false,
        failedAttempts: result.failedAttempts || 0,
      };
    } catch (error: any) {
      // Если ошибка содержит JSON с информацией о капче, парсим её
      if (error.message && error.message.startsWith('{')) {
        try {
          const errorData = JSON.parse(error.message);
          response.status(error.status || 400);
          return errorData;
        } catch {
          // Если не удалось распарсить, возвращаем обычную ошибку
        }
      }
      throw error;
    }
  }

  @Auth(AuthTypeEnum.None)
  @HttpCode(HttpStatus.OK)
  @Get('captcha-status')
  async getCaptchaStatus(@Query('email') email: string) {
    if (!email) {
      return { requiresCaptcha: false, failedAttempts: 0 };
    }
    return this.authService.getFailedAttemptsStatus(email);
  }

  @Auth(AuthTypeEnum.None)
  @Throttle({ default: { limit: 50, ttl: 60000 } }) // 50 requests per minute for refresh-tokens
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Приоритет: сначала из cookie (автоматический flow после sign-in), потом из body (для ручного тестирования)
    const refreshTokenFromCookie = request.cookies?.refreshToken;
    const refreshTokenFromBody = refreshTokenDto?.refreshToken;
    const refreshToken = refreshTokenFromCookie || refreshTokenFromBody;
    
    console.log('🔍 Refresh token check:', {
      source: refreshTokenFromCookie ? 'cookie' : 'body',
      hasCookie: !!refreshTokenFromCookie,
      hasBody: !!refreshTokenFromBody,
      cookieLength: refreshTokenFromCookie?.length,
    });
    
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refreshTokens({ refreshToken });

    // Обновляем refresh token в cookie
    // Для dev: sameSite 'lax' работает для localhost
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? process.env.COOKIE_DOMAIN?.replace(/^\.+/, '') : undefined;
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? 'none' : 'lax', // 'lax' для localhost, 'none' для HTTPS cross-origin
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/', // Явно указываем path
      domain: cookieDomain// Из env или по умолчанию для dev/prod (без точки для точного совпадения)
    });

    // Возвращаем только accessToken, refreshToken всегда в httpOnly cookie
    return { accessToken: tokens.accessToken };
  }

  @Auth(AuthTypeEnum.Bearer)
  @UseGuards(AuthenticationGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user.sub);
    
    // Очищаем refresh token cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = isProduction ? process.env.COOKIE_DOMAIN?.replace(/^\.+/, '') : undefined;
    
    // Полная очистка cookie с теми же параметрами что и при установке
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProduction ? true : false,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/', // Важно - тот же path что при установке
      domain: cookieDomain,
    });

    console.log('✅ Logout successful, cookies cleared');
    return { message: 'Successfully logged out' };
  }

  @Auth(AuthTypeEnum.Bearer)
  @UseGuards(AuthenticationGuard)
  @Get('profile')
  async getProfile(@ActiveUser() user: ActiveUserData) {
    return user;
  }

  @Auth(AuthTypeEnum.None)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for forgot-password
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { message: 'Password reset link has been sent to your email' };
  }

  @Auth(AuthTypeEnum.None)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for reset-password
  @HttpCode(HttpStatus.OK)
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    // Validate that passwords match
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
    return { message: 'Password has been successfully reset.' };
  }

  @Auth(AuthTypeEnum.None)
  @HttpCode(HttpStatus.OK)
  @Get('password-requirements')
  async getPasswordRequirements() {
    // Return password requirements for client-side validation sync
    return {
      minLength: 6,
      maxLength: 25,
      requireUppercase: true,
      requireLowercase: false,
      requireNumber: false,
      requireSpecialChar: true,
      specialChars: '!@#$%^&*()_+-=[]{};\':"|,.<>/?',
    };
  }
}

