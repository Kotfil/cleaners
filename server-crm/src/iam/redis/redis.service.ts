import { Injectable, Inject, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;
  private isConnected = false;

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: Redis,
  ) {
    this.redisClient = this.client;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redisClient.on('ready', () => {
      this.isConnected = true;
      this.logger.log('Redis connection ready');
    });

    this.redisClient.on('error', (err: Error) => {
      this.logger.error(`Redis error: ${err.message}`, err.stack);
      this.isConnected = false;
    });

    this.redisClient.on('close', () => {
      this.isConnected = false;
      this.logger.warn('Redis connection closed');
    });

    this.redisClient.on('reconnecting', (delay: number) => {
      this.logger.warn(`Redis reconnecting in ${delay}ms`);
      this.isConnected = false;
    });
  }

  async onModuleInit() {
    try {
      const status = this.redisClient.status;
      if (status === 'ready') {
        this.isConnected = true;
        this.logger.log('Redis already connected');
        return;
      }
      if (status === 'connecting' || status === 'reconnecting') {
        this.logger.log(`Redis is ${status}, waiting...`);
        return;
      }
      if (status === 'end' || status === 'close') {
        this.logger.warn('Redis connection was closed, will reconnect automatically');
        return;
      }
      await this.redisClient.connect();
    } catch (err) {
      if (err.message.includes('Connection is closed')) {
        this.logger.warn('Redis connection closed, will reconnect automatically');
      } else {
        this.logger.error(`Failed to connect to Redis: ${err.message}`, err.stack);
      }
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.redisClient.quit();
    }
  }

  private async executeCommand<T>(
    operation: () => Promise<T>,
    fallbackValue: T,
    operationName: string,
  ): Promise<T> {
    if (!this.isConnected) {
      this.logger.warn(`Redis not connected, skipping ${operationName}`);
      return fallbackValue;
    }
    try {
      return await operation();
    } catch (err) {
      this.logger.error(`Redis ${operationName} failed: ${err.message}`, err.stack);
      if (err.message.includes('Connection is closed') || err.message.includes('timeout')) {
        this.isConnected = false;
      }
      return fallbackValue;
    }
  }

  // Основные операции с ключами
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.executeCommand(
      async () => {
        if (ttlSeconds) {
          await this.redisClient.setex(key, ttlSeconds, value);
        } else {
          await this.redisClient.set(key, value);
        }
      },
      undefined,
      `set(${key})`,
    );
  }

  async get(key: string): Promise<string | null> {
    return this.executeCommand(
      () => this.redisClient.get(key),
      null,
      `get(${key})`,
    );
  }

  async del(key: string): Promise<number> {
    return this.executeCommand(
      () => this.redisClient.del(key),
      0,
      `del(${key})`,
    );
  }

  async exists(key: string): Promise<boolean> {
    return this.executeCommand(
      async () => {
        const result = await this.redisClient.exists(key);
        return result === 1;
      },
      false,
      `exists(${key})`,
    );
  }

  // Операции с TTL
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    return this.executeCommand(
      async () => {
        const result = await this.redisClient.expire(key, ttlSeconds);
        return result === 1;
      },
      false,
      `expire(${key})`,
    );
  }

  async ttl(key: string): Promise<number> {
    return this.executeCommand(
      () => this.redisClient.ttl(key),
      -1,
      `ttl(${key})`,
    );
  }

  // Операции с множествами
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.executeCommand(
      () => this.redisClient.sadd(key, ...members),
      0,
      `sadd(${key})`,
    );
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.executeCommand(
      () => this.redisClient.srem(key, ...members),
      0,
      `srem(${key})`,
    );
  }

  async smembers(key: string): Promise<string[]> {
    return this.executeCommand(
      () => this.redisClient.smembers(key),
      [],
      `smembers(${key})`,
    );
  }

  async sismember(key: string, member: string): Promise<boolean> {
    return this.executeCommand(
      async () => {
        const result = await this.redisClient.sismember(key, member);
        return result === 1;
      },
      false,
      `sismember(${key})`,
    );
  }

  // Операции с хешами
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.executeCommand(
      () => this.redisClient.hset(key, field, value),
      0,
      `hset(${key})`,
    );
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.executeCommand(
      () => this.redisClient.hget(key, field),
      null,
      `hget(${key})`,
    );
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.executeCommand(
      () => this.redisClient.hdel(key, field),
      0,
      `hdel(${key})`,
    );
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.executeCommand(
      () => this.redisClient.hgetall(key),
      {},
      `hgetall(${key})`,
    );
  }

  // Операции с JSON (если используется RedisJSON)
  async jsonSet(key: string, path: string, value: any): Promise<string> {
    return this.executeCommand(
      async () => {
        const result = await this.redisClient.call('JSON.SET', key, path, JSON.stringify(value));
        return result as string;
      },
      'OK',
      `jsonSet(${key})`,
    );
  }

  async jsonGet(key: string, path?: string): Promise<any> {
    return this.executeCommand(
      async () => {
        const result = await this.redisClient.call('JSON.GET', key, path || '.');
        return result ? JSON.parse(result as string) : null;
      },
      null,
      `jsonGet(${key})`,
    );
  }

  // Операции с потоками (Redis Streams)
  async xadd(stream: string, id: string, fields: Record<string, string>): Promise<string> {
    return this.executeCommand(
      async () => {
        const args = [stream, id];
        Object.entries(fields).forEach(([key, value]) => {
          args.push(key, value);
        });
        const result = await this.redisClient.call('XADD', ...args);
        return result as string;
      },
      '',
      `xadd(${stream})`,
    );
  }

  // Операции с геоданными
  async geoadd(key: string, longitude: number, latitude: number, member: string): Promise<number> {
    return this.executeCommand(
      () => this.redisClient.geoadd(key, longitude, latitude, member),
      0,
      `geoadd(${key})`,
    );
  }

  async georadius(key: string, longitude: number, latitude: number, radius: number, unit: 'm' | 'km' | 'mi' | 'ft' = 'km'): Promise<string[]> {
    return this.executeCommand(
      async () => {
        const result = await this.redisClient.georadius(key, longitude, latitude, radius, unit);
        return result as string[];
      },
      [],
      `georadius(${key})`,
    );
  }

  // Операции с индексами
  async ftCreate(index: string, schema: any): Promise<string> {
    return this.executeCommand(
      async () => {
        const result = await this.redisClient.call('FT.CREATE', index, ...schema);
        return result as string;
      },
      'OK',
      `ftCreate(${index})`,
    );
  }

  async ftSearch(index: string, query: string): Promise<any> {
    return this.executeCommand(
      () => this.redisClient.call('FT.SEARCH', index, query),
      [],
      `ftSearch(${index})`,
    );
  }

  // Утилиты
  async ping(): Promise<string> {
    return this.executeCommand(
      () => this.redisClient.ping(),
      'PONG',
      'ping',
    );
  }

  async flushdb(): Promise<string> {
    return this.executeCommand(
      () => this.redisClient.flushdb(),
      'OK',
      'flushdb',
    );
  }

  async flushall(): Promise<string> {
    return this.executeCommand(
      () => this.redisClient.flushall(),
      'OK',
      'flushall',
    );
  }

  // Получить клиент для прямых операций
  getClient(): Redis {
    return this.redisClient;
  }
}
