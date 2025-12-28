import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private redisClient: Redis;

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: Redis,
  ) {
    this.redisClient = this.client;
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  // Основные операции с ключами
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.setex(key, ttlSeconds, value);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  // Операции с TTL
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redisClient.expire(key, ttlSeconds);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    return this.redisClient.ttl(key);
  }

  // Операции с множествами
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.redisClient.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redisClient.sismember(key, member);
    return result === 1;
  }

  // Операции с хешами
  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redisClient.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redisClient.hget(key, field);
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.redisClient.hdel(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redisClient.hgetall(key);
  }

  // Операции с JSON (если используется RedisJSON)
  async jsonSet(key: string, path: string, value: any): Promise<string> {
    const result = await this.redisClient.call('JSON.SET', key, path, JSON.stringify(value));
    return result as string;
  }

  async jsonGet(key: string, path?: string): Promise<any> {
    const result = await this.redisClient.call('JSON.GET', key, path || '.');
    return result ? JSON.parse(result as string) : null;
  }

  // Операции с потоками (Redis Streams)
  async xadd(stream: string, id: string, fields: Record<string, string>): Promise<string> {
    const args = [stream, id];
    Object.entries(fields).forEach(([key, value]) => {
      args.push(key, value);
    });
    const result = await this.redisClient.call('XADD', ...args);
    return result as string;
  }

  // Операции с геоданными
  async geoadd(key: string, longitude: number, latitude: number, member: string): Promise<number> {
    return this.redisClient.geoadd(key, longitude, latitude, member);
  }

  async georadius(key: string, longitude: number, latitude: number, radius: number, unit: 'm' | 'km' | 'mi' | 'ft' = 'km'): Promise<string[]> {
    const result = await this.redisClient.georadius(key, longitude, latitude, radius, unit);
    return result as string[];
  }

  // Операции с индексами
  async ftCreate(index: string, schema: any): Promise<string> {
    const result = await this.redisClient.call('FT.CREATE', index, ...schema);
    return result as string;
  }

  async ftSearch(index: string, query: string): Promise<any> {
    return this.redisClient.call('FT.SEARCH', index, query);
  }

  // Утилиты
  async ping(): Promise<string> {
    return this.redisClient.ping();
  }

  async flushdb(): Promise<string> {
    return this.redisClient.flushdb();
  }

  async flushall(): Promise<string> {
    return this.redisClient.flushall();
  }

  // Получить клиент для прямых операций
  getClient(): Redis {
    return this.redisClient;
  }
}
