import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards} from '@nestjs/common';
import {ClientsService} from './clients.service';
import {Client} from '../../entities/client.entity';
import {CreateClientDto} from './dto/create-client.dto';
import {InviteClientDto} from './dto/invite-client.dto';
import {Permissions} from '../../iam/authorization';
import {Permission} from '../../enums/permission.enum';
import {Auth} from "../../iam/decorators/auth.decorator";
import {AuthTypeEnum} from "../../iam/enums/auth-type.enum";
import {AuthenticationGuard} from '../../iam/guards/authentication.guard';
import {Throttle} from '@nestjs/throttler';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}
  @Auth(AuthTypeEnum.Bearer)
  @Get()
  @Permissions(Permission.CLIENT_READ)
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ): Promise<{ data: Client[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.clientsService.findAll(pageNum, limitNum, status);
  }

  @Auth(AuthTypeEnum.Bearer)
  @Get('search')
  @Permissions(Permission.CLIENT_READ)
  async search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ data: Client[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.clientsService.searchClients(query, pageNum, limitNum);
  }

  @Auth(AuthTypeEnum.Bearer)
  @Get('check-phone/:phoneNumber')
  @Permissions(Permission.CLIENT_READ)
  async checkPhoneExists(
    @Param('phoneNumber') phoneNumber: string,
    @Query('excludeClientId') excludeClientId?: string
  ): Promise<{ exists: boolean; clientId?: string }> {
    return this.clientsService.checkPhoneExists(phoneNumber, excludeClientId);
  }

  @Auth(AuthTypeEnum.Bearer)
  @Get(':id')
  @Permissions(Permission.CLIENT_READ)
  async findOne(@Param('id') id: string): Promise<Client | null> {
    return this.clientsService.findOne(id);
  }

  @Auth(AuthTypeEnum.Bearer)
  @Post()
  @Permissions(Permission.CLIENT_CREATE)
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Auth(AuthTypeEnum.Bearer)
  @Put(':id')
  @Permissions(Permission.CLIENT_UPDATE)
  async update(@Param('id') id: string, @Body() clientData: Partial<Client>): Promise<Client | null> {
    return this.clientsService.update(id, clientData);
  }

  @Auth(AuthTypeEnum.Bearer)
  @Delete(':id')
  @Permissions(Permission.CLIENT_DELETE)
  async remove(@Param('id') id: string): Promise<void> {
    return this.clientsService.remove(id);
  }

  @Auth(AuthTypeEnum.Bearer)
  @Get('active/all')
  @Permissions(Permission.CLIENT_READ)
  async getActiveClients(): Promise<Client[]> {
    return this.clientsService.getActiveClients();
  }

  @Auth(AuthTypeEnum.Bearer)
  @UseGuards(AuthenticationGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute for invite
  @HttpCode(HttpStatus.OK)
  @Post('invite')
  @Permissions(Permission.CLIENT_CREATE)
  async inviteClient(@Body() inviteClientDto: InviteClientDto) {
    await this.clientsService.inviteClient(inviteClientDto.email, inviteClientDto.role);
    return { message: 'Invitation email has been sent.' };
  }
}
