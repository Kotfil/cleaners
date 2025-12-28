import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RedisService } from '../redis/redis.service';
import { RecaptchaService } from '../recaptcha/recaptcha.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../../modules/users/users.service';
import jwtConfig from '../config/jwt.config';
import { UserStatus } from '../../enums/user-status.enum';
import { CreateUserDto } from '../../modules/users/dto/create-user.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly redisService: RedisService,
    private readonly recaptchaService: RecaptchaService,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<Omit<User, 'password'>> {
    const { email, password, name, role, secondaryRoles, phones, phone, canSignIn = true, street, apt, city, state, zipCode, notes } = signUpDto;

    // Проверяем, существует ли пользователь с ACTIVE или SUSPENDED статусом
    // ARCHIVED пользователи игнорируются - их email считается свободным
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email, status: UserStatus.ACTIVE },
        { email, status: UserStatus.SUSPENDED },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Если canSignIn = true, пароль обязателен
    if (canSignIn && !password) {
      throw new BadRequestException('Password is required when canSignIn is true');
    }

    // Получаем основную роль пользователя (обязательное поле)
    const roleEntity = await this.rolesRepository.findOne({
      where: { name: role }
    });
    if (!roleEntity) {
      throw new NotFoundException(`Role '${role}' not found`);
    }

    // Получаем вторичные роли если указаны
    let secondaryRoleEntities: Role[] = [];
    if (secondaryRoles && secondaryRoles.length > 0) {
      secondaryRoleEntities = await this.rolesRepository.findBy({
        name: In(secondaryRoles)
      });
      if (secondaryRoleEntities.length !== secondaryRoles.length) {
        const foundNames = secondaryRoleEntities.map(r => r.name);
        const missing = secondaryRoles.filter(name => !foundNames.includes(name));
        throw new NotFoundException(`Secondary role(s) not found: ${missing.join(', ')}`);
      }
    }

    // Автоматически определяем статус на основе canSignIn
    // Если canSignIn = true, статус ACTIVE, иначе SUSPENDED
    const userStatus = canSignIn ? UserStatus.ACTIVE : UserStatus.SUSPENDED;

    // Хешируем пароль только если он предоставлен
    const hashedPassword = password ? await bcrypt.hash(password, 12) : '';

    // Подготовка phones: используем phones если есть, иначе мигрируем phone (backward compatibility)
    let finalPhones = phones;
    if (!finalPhones && phone && phone.trim()) {
      // Format phone to 16 characters if needed
      let formattedPhone = phone.trim();
      if (formattedPhone.length !== 16) {
        const digits = formattedPhone.replace(/\D/g, '');
        formattedPhone = '+' + digits.padStart(15, '0').slice(0, 15);
      }
      if (formattedPhone.length === 16) {
        finalPhones = [{ number: formattedPhone, isPrimary: true }];
      }
    }

    // Создаем пользователя через UsersService для поддержки phones и адресов
    const createUserDto: CreateUserDto = {
      email,
      password: hashedPassword,
      name,
      roleId: roleEntity.id,
      secondaryRoleIds: secondaryRoleEntities.map(r => r.id),
      status: userStatus,
      canSignIn,
      phones: finalPhones,
      street,
      apt,
      city,
      state,
      zipCode,
      notes,
    };

    const savedUser = await this.usersService.create(createUserDto);

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Omit<User, 'password'>;
  }

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

  async validateUser(email: string, password: string): Promise<ActiveUserData | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'status'],
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
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role?.name || 'cleaner',
      permissions: user.permissions,
    };
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
   * Invite user to sign up - sends invitation email with token
   * @param email - Email address to invite
   * @param role - Role name to assign to user
   */
  async inviteUser(email: string, role: string): Promise<void> {
    // Проверяем, существует ли пользователь с ACTIVE или SUSPENDED статусом
    // ARCHIVED пользователи игнорируются - их email считается свободным
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email, status: UserStatus.ACTIVE },
        { email, status: UserStatus.SUSPENDED },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Проверяем, что роль существует
    const roleEntity = await this.rolesRepository.findOne({
      where: { name: role }
    });
    if (!roleEntity) {
      throw new NotFoundException(`Role '${role}' not found`);
    }

    // Проверяем, есть ли уже активное приглашение для этого email
    const emailInviteKey = `user-invite-email:${email}`;
    const existingToken = await this.redisService.get(emailInviteKey);

    // Если есть старое приглашение - удаляем его
    if (existingToken) {
      const oldInviteTokenKey = `user-invite:${existingToken}`;
      await this.redisService.del(oldInviteTokenKey);
      await this.redisService.del(emailInviteKey);
    }

    // Генерируем новый токен приглашения
    const inviteToken = randomUUID();
    const inviteTokenKey = `user-invite:${inviteToken}`;
    
    // Сохраняем email и роль в Redis с токеном на 2 часа (7200 секунд)
    // Используем JSON для хранения email и роли
    const inviteData = JSON.stringify({ email, role });
    await this.redisService.set(inviteTokenKey, inviteData, 7200);
    // Сохраняем обратную связь email -> token для быстрого поиска
    await this.redisService.set(emailInviteKey, inviteToken, 7200);

    // Отправляем email с приглашением
    console.log('📧 Starting invitation email send process:', {
      email,
      role,
      token: inviteToken,
      tokenKey: inviteTokenKey,
    });

    try {
      await this.emailService.sendInvitationEmail(email, inviteToken, '');
      console.log('✅ Invitation process completed successfully for:', email);
    } catch (error) {
      console.error('❌ Failed to send invitation email:', {
        email,
        error: error.message,
        stack: error.stack,
      });
      // Удаляем токены если не удалось отправить email
      await this.redisService.del(inviteTokenKey);
      await this.redisService.del(emailInviteKey);
      throw new BadRequestException(`Failed to send invitation email: ${error.message}`);
    }
  }

  /**
   * Validate invitation token
   * @param token - Invitation token
   * @returns true if token is valid, false otherwise
   */
  async validateInviteToken(token: string): Promise<boolean> {
    const inviteTokenKey = `user-invite:${token}`;
    const storedEmail = await this.redisService.get(inviteTokenKey);
    return !!storedEmail;
  }

  /**
   * Get email from invitation token
   * @param token - Invitation token
   * @returns Email address associated with the token or null if not found
   */
  async getEmailFromInviteToken(token: string): Promise<string | null> {
    const inviteTokenKey = `user-invite:${token}`;
    const storedData = await this.redisService.get(inviteTokenKey);

    if (!storedData) {
      return null;
    }

    // Поддержка старого формата (просто email) и нового (JSON)
    try {
      const parsed = JSON.parse(storedData);
      return parsed.email;
    } catch {
      // Старый формат - просто email
      return storedData;
    }
  }

  /**
   * Sign up with invitation token
   * @param signUpWithTokenDto - Sign up data with token
   */
  async signUpWithToken(signUpWithTokenDto: {
    token: string;
    email: string;
    password: string;
    name?: string;
    role: string;
    phones?: Array<{ number: string; isPrimary?: boolean }>;
  }): Promise<Omit<User, 'password'>> {
    const { token, email, password, name, role, phones } = signUpWithTokenDto;

    // Проверяем токен в Redis
    const inviteTokenKey = `user-invite:${token}`;
    const storedData = await this.redisService.get(inviteTokenKey);

    if (!storedData) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Парсим данные из Redis (поддержка старого и нового формата)
    let storedEmail: string;
    let storedRole: string | undefined;

    try {
      const parsed = JSON.parse(storedData);
      storedEmail = parsed.email;
      storedRole = parsed.role;
    } catch {
      // Старый формат - просто email
      storedEmail = storedData;
    }

    // Проверяем, что email из токена совпадает с переданным email
    if (storedEmail !== email) {
      throw new BadRequestException('Email does not match invitation');
    }

    // Проверяем, что пользователь с таким email еще не существует
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email, status: UserStatus.ACTIVE },
        { email, status: UserStatus.SUSPENDED },
      ],
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Используем роль из токена если она есть, иначе из запроса
    const roleToUse = storedRole || role;

    // Получаем роль пользователя
    const roleEntity = await this.rolesRepository.findOne({
      where: { name: roleToUse }
    });
    if (!roleEntity) {
      throw new NotFoundException(`Role '${roleToUse}' not found`);
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);

    // Создаем пользователя через UsersService для поддержки phones
    const createUserDto: CreateUserDto = {
      email,
      password: hashedPassword,
      name,
      roleId: roleEntity.id,
      status: UserStatus.ACTIVE,
      canSignIn: true,
      phones,
    };

    const savedUser = await this.usersService.create(createUserDto);

    // Удаляем токен из Redis после успешной регистрации
    await this.redisService.del(inviteTokenKey);
    // Удаляем обратную связь email -> token
    const emailInviteKey = `user-invite-email:${email}`;
    await this.redisService.del(emailInviteKey);

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as Omit<User, 'password'>;
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
