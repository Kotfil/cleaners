import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../entities/client.entity';
import { ClientPhone } from '../../entities/client-phone.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { ClientStatus } from '../../enums/client-status.enum';
import { RedisService } from '../../iam/redis/redis.service';
import { EmailService } from '../../iam/email/email.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private clientsRepository: Repository<Client>,
    @InjectRepository(ClientPhone)
    private clientPhonesRepository: Repository<ClientPhone>,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(page: number = 1, limit: number = 10, status?: string): Promise<{ data: Client[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const skip = (page - 1) * limit;
    const whereCondition: any = {};
    
    // Добавляем фильтр по статусу если он указан
    console.log('[CLIENTS SERVICE] findAll called with status:', status, 'type:', typeof status);
    if (status && ['active', 'suspended', 'archived'].includes(status)) {
      whereCondition.status = status as ClientStatus;
      console.log('[CLIENTS SERVICE] Applying status filter:', whereCondition.status);
    } else {
      console.log('[CLIENTS SERVICE] No status filter applied. Where condition:', whereCondition);
    }
    
    const [data, total] = await this.clientsRepository.findAndCount({
      where: whereCondition,
      relations: ['phones'],
      select: [
        'id',
        'email',
        'name',
        'street',
        'formattedAddress',
        'city',
        'state',
        'status',
        'canSignIn',
        'createdAt',
      ],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { id },
      relations: ['phones'],
    });
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.clientsRepository.findOne({
      where: { email },
    });
  }

  /**
   * Check if phone number exists in the database
   * @param phoneNumber Phone number to check (12 characters format)
   * @param excludeClientId Optional client ID to exclude from search (for editing client)
   * @returns Object with exists flag and optional clientId
   */
  async checkPhoneExists(
    phoneNumber: string,
    excludeClientId?: string
  ): Promise<{ exists: boolean; clientId?: string }> {
    try {
      // Find phone in ClientPhone table
      const queryBuilder = this.clientPhonesRepository
        .createQueryBuilder('phone')
        .leftJoinAndSelect('phone.client', 'client')
        .where('phone.number = :phoneNumber', { phoneNumber });

      // Exclude specific client if provided (for editing scenarios)
      if (excludeClientId) {
        queryBuilder.andWhere('client.id != :excludeClientId', { excludeClientId });
      }

      const phoneRecord = await queryBuilder.getOne();

      if (phoneRecord && phoneRecord.client) {
        return {
          exists: true,
          clientId: phoneRecord.client.id,
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('❌ Error checking phone existence:', error);
      throw new BadRequestException('Failed to check phone number');
    }
  }

  async create(createClientDto: CreateClientDto): Promise<Client> {
    // Validate phones
    if (createClientDto.phones && createClientDto.phones.length > 0) {
      if (createClientDto.phones.length > 10) {
        throw new BadRequestException('Maximum 10 phone numbers allowed');
      }
      
      const primaryCount = createClientDto.phones.filter(p => p.isPrimary).length;
      if (primaryCount === 0) {
        // Set first phone as primary if none is marked
        createClientDto.phones[0].isPrimary = true;
      } else if (primaryCount > 1) {
        throw new BadRequestException('Only one phone number can be marked as primary');
      }

      // Validate all phones are in E.164 format (12 characters for USA: +1XXXXXXXXXX)
      for (const phone of createClientDto.phones) {
        if (phone.number.length !== 12) {
          throw new BadRequestException(`Phone number must be exactly 12 characters: ${phone.number}`);
        }
        if (!phone.number.startsWith('+1')) {
          throw new BadRequestException(`Phone number must start with +1: ${phone.number}`);
        }
      }
    } else {
      throw new BadRequestException('At least one phone number is required');
    }

    const { phones, status, canSignIn, ...clientData } = createClientDto;
    
    // Set default status if not provided
    const clientStatus = status || ClientStatus.ACTIVE;
    
    // Set canSignIn based on status if not explicitly provided
    const clientCanSignIn = canSignIn !== undefined ? canSignIn : (clientStatus === ClientStatus.ACTIVE);
    
    const client = this.clientsRepository.create({
      ...clientData,
      status: clientStatus,
      canSignIn: clientCanSignIn,
    });
    const savedClient = await this.clientsRepository.save(client);

    // Create phone records
    if (phones && phones.length > 0) {
      const phoneEntities = phones.map(phoneDto => 
        this.clientPhonesRepository.create({
          ...phoneDto,
          clientId: savedClient.id,
        })
      );
      await this.clientPhonesRepository.save(phoneEntities);
    }

    return this.findOne(savedClient.id) as Promise<Client>;
  }

  async update(id: string, clientData: Partial<Client & { phones?: CreateClientDto['phones'] }>): Promise<Client | null> {
    const { phones, status, canSignIn, ...restClientData } = clientData as any;
    
    // Handle status and canSignIn logic
    const updateData: any = { ...restClientData };
    
    if (status !== undefined) {
      updateData.status = status;
      // Auto-set canSignIn based on status if not explicitly provided
      if (canSignIn === undefined) {
        updateData.canSignIn = status === ClientStatus.ACTIVE;
      }
    }
    
    if (canSignIn !== undefined) {
      updateData.canSignIn = canSignIn;
    }
    
    // Update client basic data
    if (Object.keys(updateData).length > 0) {
      await this.clientsRepository.update(id, updateData);
    }

    // Update phones if provided
    if (phones !== undefined) {
      // Validate phones
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
        await this.clientPhonesRepository.delete({ clientId: id });

        // Create new phones
        const phoneEntities = phones.map(phoneDto => 
          this.clientPhonesRepository.create({
            ...phoneDto,
            clientId: id,
          })
        );
        await this.clientPhonesRepository.save(phoneEntities);
      } else {
        // If empty array, delete all phones (but at least one is required)
        throw new BadRequestException('At least one phone number is required');
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.clientsRepository.delete(id);
  }

  async getActiveClients(): Promise<Client[]> {
    return this.clientsRepository.find({
      where: { status: ClientStatus.ACTIVE },
      relations: ['phones'],
      select: ['id', 'email', 'name', 'street', 'formattedAddress', 'city', 'status', 'canSignIn'],
    });
  }

  async searchClients(query: string, page: number = 1, limit: number = 10): Promise<{ data: Client[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    // Проверяем, содержит ли запрос цифры или + (поиск по телефону)
    const hasPhoneChars = /[\d+]/.test(query);
    const searchPattern = `%${query}%`;
    const safeLimit = Math.max(Math.min(limit, 100), 1);
    const safePage = Math.max(page, 1);
    const skip = (safePage - 1) * safeLimit;
    
    const queryBuilder = this.clientsRepository
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.phones', 'phone')
      .where(
        '(client.name ILIKE :query OR client.email ILIKE :query' + 
        (hasPhoneChars ? ' OR phone.number ILIKE :query' : '') +
        ' OR client.street ILIKE :query' +
        ' OR client.apt ILIKE :query' +
        ' OR client.city ILIKE :query' +
        ' OR client.state ILIKE :query' +
        ' OR client.zipCode ILIKE :query' +
        ' OR client.formattedAddress ILIKE :query)',
        { query: searchPattern }
      )
      .andWhere('client.status = :status', { status: ClientStatus.ACTIVE })
      .select([
        'client.id',
        'client.email',
        'client.name',
        'client.street',
        'client.apt',
        'client.city',
        'client.state',
        'client.zipCode',
        'client.formattedAddress',
        'client.status',
        'client.canSignIn',
        'client.createdAt',
        'phone.id',
        'phone.number',
        'phone.isPrimary',
      ])
      .orderBy('client.createdAt', 'DESC')
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

  /**
   * Invite client to sign up - sends invitation email with token
   * @param email - Email address to invite
   * @param role - Role name (should be 'client')
   */
  async inviteClient(email: string, role: string): Promise<void> {
    // Проверяем, что роль 'client'
    if (role !== 'client') {
      throw new BadRequestException('Only "client" role can be invited through this endpoint');
    }

    // Проверяем, существует ли клиент с ACTIVE или SUSPENDED статусом
    const existingClient = await this.clientsRepository.findOne({
      where: [
        { email, status: ClientStatus.ACTIVE },
        { email, status: ClientStatus.SUSPENDED },
      ],
    });

    if (existingClient) {
      throw new ConflictException('Email already in use');
    }

    // Проверяем, есть ли уже активное приглашение для этого email
    const emailInviteKey = `client-invite-email:${email}`;
    const existingToken = await this.redisService.get(emailInviteKey);

    // Если есть старое приглашение - удаляем его
    if (existingToken) {
      const oldInviteTokenKey = `client-invite:${existingToken}`;
      await this.redisService.del(oldInviteTokenKey);
      await this.redisService.del(emailInviteKey);
    }

    // Генерируем новый токен приглашения
    const inviteToken = randomUUID();
    const inviteTokenKey = `client-invite:${inviteToken}`;
    
    // Сохраняем email и роль в Redis с токеном на 2 часа (7200 секунд)
    const inviteData = JSON.stringify({ email, role });
    await this.redisService.set(inviteTokenKey, inviteData, 7200);
    // Сохраняем обратную связь email -> token для быстрого поиска
    await this.redisService.set(emailInviteKey, inviteToken, 7200);

    // Отправляем email с приглашением для client portal
    console.log('📧 Starting client invitation email send process:', {
      email,
      role,
      token: inviteToken,
      tokenKey: inviteTokenKey,
    });

    try {
      await this.emailService.sendClientInvitationEmail(email, inviteToken, '');
      console.log('✅ Client invitation process completed successfully for:', email);
    } catch (error) {
      console.error('❌ Failed to send client invitation email:', {
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
}
