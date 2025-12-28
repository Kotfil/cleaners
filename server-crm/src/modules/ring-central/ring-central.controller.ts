import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { Auth } from '../../iam/decorators/auth.decorator';
import { AuthTypeEnum } from '../../iam/enums/auth-type.enum';
import { RingCentralService } from './ring-central.service';

export class SendSmsDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+1\d{10}$/, { message: 'Phone number must be in E.164 format: +1XXXXXXXXXX (10 digits after +1)' })
  to: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}

/**
 * RingCentral SMS controller
 */
@Controller('ring-central')
export class RingCentralController {
  constructor(private readonly ringCentralService: RingCentralService) {}

  @Auth(AuthTypeEnum.None)
  @Get('test')
  @HttpCode(HttpStatus.OK)
  async testConfig() {
    return await this.ringCentralService.testConfiguration();
  }

  @Auth(AuthTypeEnum.None)
  @Post('sms')
  @HttpCode(HttpStatus.OK)
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    return await this.ringCentralService.sendSms(sendSmsDto.to, sendSmsDto.text);
  }
}

