import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { User } from '../../entities/user.entity';
import { SignInDto } from '../dto/sign-in.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RedisService } from '../redis/redis.service';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import { EmailService } from '../email/email.service';
import jwtConfig from '../config/jwt.config';
import { UserStatus } from '../../enums/user-status.enum';

/**
 * Authentication service for client portal
 * Read-only operations - uses shared database from server-crm
 */
@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly redisService: RedisService,
    private readonly recaptchaService: RecaptchaService,
    private readonly emailService: EmailService,
  ) {}

  async signIn(signInDto: SignInDto, remoteip?: string): Promise<{ accessToken: string; refreshToken: string; requiresCaptcha?: boolean; failedAttempts?: number }> {
    const { email, password, captcha } = signInDto;

    // Проверяем количество неудачных попыток
    const failedAttemptsKey = `failed-login-attempts:${email}`;
    const failedAttempts = await this.redisService.get(failedAttemptsKey);
    const attemptsCount = failedAttempts ? parseInt(failedAttempts, 10) : 0;
    const requiresCaptcha = attemptsCount >= 5;

    // Если требуется капча, проверяем её
    if (requiresCaptcha) {
      if (!captcha) {
        const newAttempts = attemptsCount + 1;
        await this.redisService.set(failedAttemptsKey, newAttempts.toString(), 900);
        throw new BadRequestException(JSON.stringify({
          message: 'Captcha is required after 5 failed attempts',
          requiresCaptcha: true,
          failedAttempts: newAttempts,
        }));
      }

      // Валидируем капчу через RecaptchaService
      const isValidCaptcha = await this.recaptchaService.verifyCaptcha(captcha, remoteip);
      if (!isValidCaptcha) {
        const newAttempts = attemptsCount + 1;
        await this.redisService.set(failedAttemptsKey, newAttempts.toString(), 900);
        throw new BadRequestException(JSON.stringify({
          message: 'Invalid captcha',
          requiresCaptcha: true,
          failedAttempts: newAttempts,
        }));
      }
    }

    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'status', 'canSignIn'],
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
        'secondaryRoles',
        'secondaryRoles.rolePermissions',
        'secondaryRoles.rolePermissions.permission',
      ],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      // Увеличиваем счетчик неудачных попыток
      const newAttempts = await this.incrementFailedAttempts(email);
      throw new UnauthorizedException(JSON.stringify({
        message: 'Invalid credentials',
        requiresCaptcha: newAttempts >= 5,
        failedAttempts: newAttempts,
      }));
    }

    if (!user.canSignIn) {
      throw new UnauthorizedException('User account does not have sign-in access');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Увеличиваем счетчик неудачных попыток
      const newAttempts = await this.incrementFailedAttempts(email);
      throw new UnauthorizedException(JSON.stringify({
        message: 'Invalid credentials',
        requiresCaptcha: newAttempts >= 5,
        failedAttempts: newAttempts,
      }));
    }

    // Если вход успешен, сбрасываем счетчик неудачных попыток
    await this.redisService.del(failedAttemptsKey);

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      requiresCaptcha: false,
      failedAttempts: 0,
    };
  }

  private async incrementFailedAttempts(email: string): Promise<number> {
    const key = `failed-login-attempts:${email}`;
    const attempts = await this.redisService.get(key);
    const newAttempts = attempts ? parseInt(attempts, 10) + 1 : 1;
    
    // Устанавливаем счетчик с TTL 15 минут
    await this.redisService.set(key, newAttempts.toString(), 900); // 15 minutes
    return newAttempts;
  }

  async getFailedAttemptsStatus(email: string): Promise<{ requiresCaptcha: boolean; failedAttempts: number }> {
    const key = `failed-login-attempts:${email}`;
    const attempts = await this.redisService.get(key);
    const attemptsCount = attempts ? parseInt(attempts, 10) : 0;
    
    return {
      requiresCaptcha: attemptsCount >= 5,
      failedAttempts: attemptsCount,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        refreshTokenId: string;
      }>(refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const { sub: userId, refreshTokenId } = payload;
      
      console.log('🔍 Verifying refresh token:', { userId, refreshTokenId });

      // Проверяем, что refresh token существует среди активных сессий пользователя в Redis (мультисессии)
      const redisKey = `refresh-tokens:${userId}`;
      const isMember = await this.redisService.sismember(redisKey, refreshTokenId);
      console.log('🔍 Redis check (set membership):', { redisKey, refreshTokenId, isMember });
      if (!isMember) {
        console.error('❌ Invalid refresh token in Redis');
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Получаем пользователя
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'name', 'status'],
        relations: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
          'secondaryRoles',
          'secondaryRoles.rolePermissions',
          'secondaryRoles.rolePermissions.permission',
        ],
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Инвалидируем старый refresh token (только текущую сессию)
      await this.redisService.srem(redisKey, refreshTokenId);

      // Генерируем новые токены
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    // Удаляем refresh token из Redis
    await this.redisService.del(`refresh-token:${userId}`);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshTokenId = randomUUID();
    
    // Получаем permissions из геттера User entity
    const userPermissions = user.permissions;
    
    console.log('⏱️ Generating tokens with TTL:', {
      accessTokenTtl: this.jwtConfiguration.accessTokenTtl,
      refreshTokenTtl: this.jwtConfiguration.refreshTokenTtl,
    });
    
    console.log('🔑 User permissions:', {
      userId: user.id,
      email: user.email,
      role: user.role?.name || 'cleaner',
      permissionsCount: userPermissions.length,
      permissions: userPermissions,
    });
    
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          role: user.role?.name || 'cleaner',
          permissions: userPermissions,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    // Сохраняем refresh token в Redis как часть набора активных сессий (мультисессии)
    const redisKey = `refresh-tokens:${user.id}`;
    await this.redisService.sadd(redisKey, refreshTokenId);
    // Обновляем TTL ключа набора, чтобы совпадал с жизнью refresh токена
    await this.redisService.expire(redisKey, this.jwtConfiguration.refreshTokenTtl);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Request password reset - generates token and sends email
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'status'],
    });

    // Throw error if user not found or not active
    if (!user) {
      throw new NotFoundException('Email not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Account is not active');
    }

    // Generate reset token
    const resetToken = randomUUID();
    const resetTokenKey = `password-reset:${resetToken}`;
    
    // Store token in Redis with 1 hour TTL (3600 seconds)
    await this.redisService.set(resetTokenKey, user.id, 3600);

    // Send password reset email (resetUrl will be generated in email service)
    // If email service is not configured, log error but don't fail the request
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken, '');
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      // Don't throw - return success for security (don't reveal if user exists)
      // Token is still saved in Redis, user can request again if needed
    }
  }

  /**
   * Reset password using token from email
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetTokenKey = `password-reset:${token}`;
    const userId = await this.redisService.get(resetTokenKey);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Get user
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await this.usersRepository.update(user.id, { password: hashedPassword });

    // Delete reset token from Redis
    await this.redisService.del(resetTokenKey);
  }

  /**
   * Sign JWT token
   * @param userId - User ID
   * @param expiresIn - Expiration time in seconds (number)
   * @param payload - Additional token payload
   * @returns Signed JWT token
   */
  private async signToken<T>(userId: string, expiresIn: number, payload?: T): Promise<string> {
    // Библиотека jsonwebtoken принимает expiresIn как число (секунды)
    return this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn, // Число в секундах
      },
    );
  }
}

