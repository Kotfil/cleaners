import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const host = configService.get<string>('REDIS_HOST', 'localhost');
        const port = configService.get<number>('REDIS_PORT', 6379);
        
        logger.log(`Connecting to Redis at ${host}:${port}`);
        
        const client = new Redis({
          host,
          port,
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          connectTimeout: 10000,
          commandTimeout: 10000,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 200, 3000);
            logger.warn(`Redis retry attempt ${times}, delay: ${delay}ms`);
            return delay;
          },
          reconnectOnError: (err: Error) => {
            const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'];
            const shouldReconnect = targetErrors.some(targetError => 
              err.message.includes(targetError)
            );
            if (shouldReconnect) {
              logger.warn(`Redis will reconnect due to: ${err.message}`);
            }
            return shouldReconnect;
          },
        });

        // Обработка ошибок подключения
        client.on('error', (err: Error) => {
          logger.error(`Redis connection error: ${err.message}`, err.stack);
        });

        client.on('connect', () => {
          logger.log('Redis client connecting...');
        });

        client.on('ready', () => {
          logger.log('Redis client ready');
        });

        client.on('close', () => {
          logger.warn('Redis connection closed');
        });

        client.on('reconnecting', (delay: number) => {
          logger.warn(`Redis reconnecting in ${delay}ms`);
        });

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
