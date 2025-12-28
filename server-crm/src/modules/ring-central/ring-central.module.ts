import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RingCentralService } from './ring-central.service';
import { RingCentralController } from './ring-central.controller';

@Module({
  imports: [HttpModule],
  controllers: [RingCentralController],
  providers: [RingCentralService],
  exports: [RingCentralService],
})
export class RingCentralModule {}

