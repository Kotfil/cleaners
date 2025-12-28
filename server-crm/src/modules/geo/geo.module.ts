import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GeoService } from './geo.service';
import { GeoController } from './geo.controller';
import { RedisModule } from '../../iam/redis/redis.module';

@Module({
  imports: [HttpModule, RedisModule],
  controllers: [GeoController],
  providers: [GeoService],
  exports: [GeoService],
})
export class GeoModule {}


