import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { UserPhone } from '../../entities/user-phone.entity';
import { Role } from '../../entities/role.entity';
import { Permission } from '../../enums/permission.enum';
import { RolesService } from '../roles/roles.service';
import { UserStatus, isValidUserStatus, USER_STATUSES } from '../../enums/user-status.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPhone)
    private userPhonesRepository: Repository<UserPhone>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private rolesService: RolesService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
  ): Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    try {
      const safeLimit = Math.max(Math.min(limit, 100), 1);
      const safePage = Math.max(page, 1);
      const skip = (safePage - 1) * safeLimit;

      const findOptions: any = {
        relations: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
          'secondaryRoles',
          'secondaryRoles.rolePermissions',
          'secondaryRoles.rolePermissions.permission',
          'phones',
        ],
        select: [
          'id',
          'email',
          'name',
          'status',
          'canSignIn',
          'avatar',
          'street',
          'city',
          'state',
          'formattedAddress',
          'createdAt',
        ],
        order: { createdAt: 'DESC' },
        skip,
        take: safeLimit,
      };

      if (status) {
        if (!isValidUserStatus(status)) {
          console.warn(`⚠️ Invalid status provided: ${status}. Valid statuses: ${USER_STATUSES.join(', ')}`);
          throw new BadRequestException(`Invalid status: ${status}. Valid statuses: ${USER_STATUSES.join(', ')}`);
        }
        // Use the validated status string directly - TypeORM will handle enum conversion
        findOptions.where = { status: status as UserStatus };
        console.log(`🔍 Filtering users by status: ${status}`);
      }

      const [data, total] = await this.usersRepository.findAndCount(findOptions);
      console.log(`✅ Found ${total} users (showing ${data.length} on page ${safePage})`);

      const totalPages = Math.max(Math.ceil(total / safeLimit), 1);

      return {
        data,
        meta: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error('❌ Error fetching users list:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        status: status,
        isValidStatus: status ? isValidUserStatus(status) : 'N/A',
      });
      // Если это уже BadRequestException, пробрасываем как есть
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to fetch users list: ${error?.message || 'Unknown error'}`);
    }
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission', 'secondaryRoles', 'secondaryRoles.rolePermissions', 'secondaryRoles.rolePermissions.permission', 'phones'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Check if phone number exists in the database
   * @param phoneNumber Phone number to check (16 characters format)
   * @param excludeUserId Optional user ID to exclude from search (for editing user)
   * @returns Object with exists flag and optional userId
   */
  async checkPhoneExists(
    phoneNumber: string,
    excludeUserId?: string
  ): Promise<{ exists: boolean; userId?: string }> {
    try {
      // Find phone in UserPhone table
      const queryBuilder = this.userPhonesRepository
        .createQueryBuilder('phone')
        .leftJoinAndSelect('phone.user', 'user')
        .where('phone.number = :phoneNumber', { phoneNumber });

      // Exclude specific user if provided (for editing scenarios)
      if (excludeUserId) {
        queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
      }

      const phoneRecord = await queryBuilder.getOne();

      if (phoneRecord && phoneRecord.user) {
        return {
          exists: true,
          userId: phoneRecord.user.id,
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('❌ Error checking phone existence:', error);
      throw new BadRequestException('Failed to check phone number');
    }
  }

  async create(createUserDto: CreateUserDto | Partial<User>): Promise<User> {
    // Handle both DTO and legacy Partial<User> format
    const isDto = 'phones' in createUserDto;
    const userData = isDto ? createUserDto as CreateUserDto : createUserDto as Partial<User>;
    
    // Role is required - validate it exists
    if (!userData.roleId) {
      throw new BadRequestException('Role is required');
    }

    // Validate phones if provided
    if (isDto && (createUserDto as CreateUserDto).phones) {
      const phones = (createUserDto as CreateUserDto).phones!;
      if (phones.length > 10) {
        throw new BadRequestException('Maximum 10 phone numbers allowed');
      }
      
      const primaryCount = phones.filter(p => p.isPrimary).length;
      if (primaryCount === 0 && phones.length > 0) {
        phones[0].isPrimary = true;
      } else if (primaryCount > 1) {
        throw new BadRequestException('Only one phone number can be marked as primary');
      }

      // Validate all phones are in E.164 format (12 characters for USA: +1XXXXXXXXXX)
      for (const phone of phones) {
        if (phone.number.length !== 12) {
          throw new BadRequestException(`Phone number must be exactly 12 characters: ${phone.number}`);
        }
        if (!phone.number.startsWith('+1')) {
          throw new BadRequestException(`Phone number must start with +1: ${phone.number}`);
        }
      }
    }

    const { phones, secondaryRoleIds, ...restUserData } = isDto ? (createUserDto as CreateUserDto) : { phones: undefined, secondaryRoleIds: undefined, ...userData };
    
    const user = this.usersRepository.create(restUserData);
    const savedUser = await this.usersRepository.save(user);

    // Assign secondary roles if provided
    if (secondaryRoleIds && secondaryRoleIds.length > 0) {
      const secondaryRoles = await this.rolesRepository.findBy({ id: In(secondaryRoleIds) });
      savedUser.secondaryRoles = secondaryRoles;
      await this.usersRepository.save(savedUser);
    }

    // Create phone records if provided
    if (isDto && phones && phones.length > 0) {
      const phoneEntities = phones.map(phoneDto => 
        this.userPhonesRepository.create({
          number: phoneDto.number,
          isPrimary: phoneDto.isPrimary ?? false,
          userId: savedUser.id,
        })
      );
      await this.userPhonesRepository.save(phoneEntities);
    }

    return this.findOne(savedUser.id) as Promise<User>;
  }

  async update(id: string, userData: Partial<User> & { phones?: CreateUserDto['phones'] }, currentUserId?: string): Promise<User | null> {
    // Получаем текущего пользователя для проверки состояния
    const currentUser = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'canSignIn', 'password', 'status'],
    });

    if (!currentUser) {
      throw new BadRequestException('User not found');
    }

    // Проверяем, что пользователь не ARCHIVED - его нельзя обновлять
    if (currentUser.status === UserStatus.ARCHIVED) {
      throw new BadRequestException('Cannot update archived user');
    }

    // Если пытаются изменить статус на ARCHIVED через update
    if (userData.status === UserStatus.ARCHIVED) {
      // Проверяем, что пользователь не пытается архивировать самого себя
      if (currentUserId && id === currentUserId) {
        throw new BadRequestException('You cannot set your own status to ARCHIVED');
      }
      
      // Архивация: сохраняем email и генерируем уникальный
      const deletedEmail = currentUser.email;
      const uniqueEmail = `archived_${currentUser.id}@archived.local`;
      
      await this.usersRepository.update(id, {
        status: UserStatus.ARCHIVED,
        deletedEmail: deletedEmail,
        email: uniqueEmail,
        canSignIn: false,
      });
      
      return this.findOne(id);
    }

    // Handle phones and secondary roles separately
    const { phones, secondaryRoleIds, email, ...restUserData } = userData as any;

    // Email не изменяется при обновлении пользователя - игнорируем его если пришел в запросе
    // Это защита на случай если кто-то попытается изменить email через API

    // Обработка name: если пустая строка или только пробелы - устанавливаем null для удаления
    if (restUserData.name !== undefined) {
      const trimmedName = typeof restUserData.name === 'string' ? restUserData.name.trim() : restUserData.name;
      restUserData.name = trimmedName === '' ? null : trimmedName;
    }

    // Автоматически управляем canSignIn на основе статуса
    // Если статус указан, автоматически устанавливаем canSignIn
    if (restUserData.status !== undefined) {
      if (restUserData.status === UserStatus.ACTIVE) {
        restUserData.canSignIn = true;
      } else if (restUserData.status === UserStatus.SUSPENDED || restUserData.status === UserStatus.ARCHIVED) {
        restUserData.canSignIn = false;
      }
    }

    // Определяем финальный статус и canSignIn
    const finalStatus = restUserData.status !== undefined ? restUserData.status : currentUser.status;
    const finalCanSignIn = restUserData.canSignIn !== undefined ? restUserData.canSignIn : (finalStatus === UserStatus.ACTIVE);
    const hasPasswordInRequest = !!restUserData.password && restUserData.password.trim().length > 0;

    // Проверяем изменение статуса с SUSPENDED на ACTIVE - требуется пароль
    const isRestoringFromSuspended = currentUser.status === UserStatus.SUSPENDED && finalStatus === UserStatus.ACTIVE;
    
    if (isRestoringFromSuspended && !hasPasswordInRequest) {
      throw new BadRequestException('Password is required when restoring user from suspended to active status');
    }

    // Логика обработки пароля:
    // 1. Если статус ACTIVE и пароль указан - обновляем
    // 2. Если восстанавливаем из SUSPENDED в ACTIVE - пароль обязателен (уже проверили выше)
    // 3. Если статус ACTIVE и пароль не указан - не отправляем (оставляем старый)
    // 4. Если статус SUSPENDED - пароль не нужен
    if (finalStatus === UserStatus.ACTIVE && hasPasswordInRequest && restUserData.password) {
      restUserData.password = await bcrypt.hash(restUserData.password, 12);
    } else {
      // Не обновляем пароль если не нужно
      delete restUserData.password;
    }

    // Update user basic data
    if (Object.keys(restUserData).length > 0) {
      await this.usersRepository.update(id, restUserData);
    }

    // Update secondary roles if provided
    if (secondaryRoleIds !== undefined) {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (user) {
        if (secondaryRoleIds && secondaryRoleIds.length > 0) {
          const secondaryRoles = await this.rolesRepository.findBy({ id: In(secondaryRoleIds) });
          user.secondaryRoles = secondaryRoles;
        } else {
          user.secondaryRoles = [];
        }
        await this.usersRepository.save(user);
      }
    }

    // Update phones if provided
    if (phones !== undefined) {
      if (phones && phones.length > 0) {
        if (phones.length > 10) {
          throw new BadRequestException('Maximum 10 phone numbers allowed');
        }
        
        const primaryCount = phones.filter(p => p.isPrimary).length;
        if (primaryCount === 0) {
          phones[0].isPrimary = true;
        } else if (primaryCount > 1) {
          throw new BadRequestException('Only one phone number can be marked as primary');
        }

        // Validate all phones are in E.164 format (12 characters for USA: +1XXXXXXXXXX)
        for (const phone of phones) {
          if (phone.number.length !== 12) {
            throw new BadRequestException(`Phone number must be exactly 12 characters: ${phone.number}`);
          }
          if (!phone.number.startsWith('+1')) {
            throw new BadRequestException(`Phone number must start with +1: ${phone.number}`);
          }
        }

        // Delete existing phones
        await this.userPhonesRepository.delete({ userId: id });

        // Create new phones
        const phoneEntities = phones.map(phoneDto => 
          this.userPhonesRepository.create({
            number: phoneDto.number,
            isPrimary: phoneDto.isPrimary ?? false,
            userId: id,
          })
        );
        await this.userPhonesRepository.save(phoneEntities);
      } else {
        // If empty array, delete all phones (phones are optional for users)
        await this.userPhonesRepository.delete({ userId: id });
      }
    }

    return this.findOne(id);
  }

  /**
   * Archive user (soft delete)
   * - Changes status to ARCHIVED
   * - Saves original email to deletedEmail
   * - Generates unique email to free up original email for reuse
   * - User can be restored later by changing status back to ACTIVE
   */
  async remove(id: string, currentUserId?: string): Promise<void> {
    // Prevent user from archiving themselves
    if (currentUserId && id === currentUserId) {
      throw new BadRequestException('You cannot archive your own account');
    }
    
    // Get user to preserve email
    const user = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'email', 'status'],
    });
    
    if (!user) {
      throw new BadRequestException('User not found');
    }
    
    // Prevent archiving already archived users
    if (user.status === UserStatus.ARCHIVED) {
      throw new BadRequestException('User is already archived');
    }
    
    // Save original email in deletedEmail and generate unique email
    const deletedEmail = user.email;
    const uniqueEmail = `archived_${user.id}@archived.local`;
    
    // Update status to ARCHIVED and change email
    await this.usersRepository.update(id, {
      status: UserStatus.ARCHIVED,
      deletedEmail: deletedEmail,
      email: uniqueEmail,
      canSignIn: false,
    });
  }

  async findByRole(roleName: string): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission', 'secondaryRoles', 'secondaryRoles.rolePermissions', 'secondaryRoles.rolePermissions.permission', 'phones'],
      where: { 
        role: { name: roleName },
        status: UserStatus.ACTIVE 
      },
      select: ['id', 'email', 'name', 'avatar', 'canSignIn'],
    });
  }

  async getActiveUsers(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission', 'secondaryRoles', 'secondaryRoles.rolePermissions', 'secondaryRoles.rolePermissions.permission', 'phones'],
      where: { status: UserStatus.ACTIVE },
      select: ['id', 'email', 'name', 'avatar', 'canSignIn'],
    });
  }

  async searchUsers(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    // Проверяем, содержит ли запрос цифры или + (поиск по телефону)
    const hasPhoneChars = /[\d+]/.test(query);
    const searchPattern = `%${query}%`;
    const safeLimit = Math.max(Math.min(limit, 100), 1);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;
    
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.rolePermissions', 'rolePermissions')
      .leftJoinAndSelect('rolePermissions.permission', 'permission')
      .leftJoinAndSelect('user.secondaryRoles', 'secondaryRole')
      .leftJoinAndSelect('secondaryRole.rolePermissions', 'secondaryRolePermissions')
      .leftJoinAndSelect('secondaryRolePermissions.permission', 'secondaryPermission')
      .leftJoinAndSelect('user.phones', 'phone')
      .where(
        '(user.name ILIKE :query OR user.email ILIKE :query' + 
        (hasPhoneChars ? ' OR phone.number ILIKE :query' : '') +
        ' OR user.street ILIKE :query' +
        ' OR user.apt ILIKE :query' +
        ' OR user.city ILIKE :query' +
        ' OR user.state ILIKE :query' +
        ' OR user.zipCode ILIKE :query' +
        ' OR user.formattedAddress ILIKE :query)',
        { query: searchPattern }
      )
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.avatar',
        'user.status',
        'user.canSignIn',
        'user.createdAt',
        'user.street',
        'user.apt',
        'user.city',
        'user.state',
        'user.zipCode',
        'user.formattedAddress',
        'role.name',
        'secondaryRole.name',
        'phone.id',
        'phone.number',
        'phone.isPrimary',
      ])
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(safeLimit);
    
    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.max(Math.ceil(total / safeLimit), 1);

    return {
      data,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  }

  // Helper method to check if user has permission
  async checkUserPermission(userId: string, permission: Permission): Promise<boolean> {
    const user = await this.findOne(userId);
    return user ? user.hasPermission(permission) : false;
  }

  // Helper method to get user permissions
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.findOne(userId);
    return user ? user.permissions : [];
  }

  /**
   * Update user role by role name
   * @param id User id
   * @param roleName Role name
   * @returns Updated user or null if not found
   */
  async updateRole(id: string, roleName: string): Promise<User | null> {
    console.log('📝 updateRole called with:', { userId: id, roleName });
    
    const user = await this.findOne(id);
    if (!user) {
      console.error(`❌ User not found: ${id}`);
      return null;
    }

    console.log('👤 Current user role:', { currentRole: user.role?.name, currentRoleId: user.roleId });

    const role = await this.rolesService.getRoleByName(roleName);
    console.log('🎭 New role found:', { roleId: role.id, roleName: role.name });
    
    // Используем прямое обновление для гарантии изменения roleId
    await this.usersRepository.update(id, { roleId: role.id });
    console.log('💾 User roleId updated in DB');
    
    // Загружаем пользователя с обновленной ролью
    const updatedUser = await this.findOne(id);
    console.log('🔄 Loaded updated user:', { newRole: updatedUser?.role?.name, newRoleId: updatedUser?.roleId });
    
    return updatedUser;
  }
}
