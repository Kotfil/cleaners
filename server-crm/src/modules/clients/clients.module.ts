import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from '../../entities/client.entity';
import { ClientPhone } from '../../entities/client-phone.entity';
import { RedisModule } from '../../iam/redis/redis.module';
import { EmailModule } from '../../iam/email/email.module';
import { IamModule } from '../../iam/iam.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, ClientPhone]),
    RedisModule,
    EmailModule,
    IamModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
