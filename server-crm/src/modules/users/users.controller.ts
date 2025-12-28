import {BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Put, Query} from '@nestjs/common';
import {UsersService} from './users.service';
import {User} from '../../entities/user.entity';
import {UpdateRoleDto} from './dto/update-role.dto';
import {ActiveUser} from '../../iam/decorators/active-user.decorator';
import {ActiveUserData} from '../../iam/interfaces/active-user-data.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  // @Permissions(Permission.USER_READ)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
  ): Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(Math.min(parseInt(limit, 10) || 10, 100), 1);
    return this.usersService.findAll(pageNumber, limitNumber, status);
  }

  @Get('search')
  // @Permissions(Permission.USER_READ)
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    if (!query || !query.trim()) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(Math.min(parseInt(limit, 10) || 10, 100), 1);
    return this.usersService.searchUsers(query.trim(), pageNumber, limitNumber);
  }

  @Get('role/:role')
  async findByRole(@Param('role') role: string): Promise<User[]> {
    return this.usersService.findByRole(role);
  }

  @Get('active/all')
  async getActiveUsers(): Promise<User[]> {
    return this.usersService.getActiveUsers();
  }

  @Get('check-phone/:phoneNumber')
  async checkPhoneExists(
    @Param('phoneNumber') phoneNumber: string,
    @Query('excludeUserId') excludeUserId?: string
  ): Promise<{ exists: boolean; userId?: string }> {
    return this.usersService.checkPhoneExists(phoneNumber, excludeUserId);
  }

  @Get(':id')
  // @Permissions(Permission.USER_READ)
  async findOne(@Param('id') id: string): Promise<User | null> {
    return this.usersService.findOne(id);
  }

  @Post()
  // @Roles('manager')
  // @Permissions(Permission.USER_CREATE)
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  @Put(':id')
  // @Roles('manager')
  // @Permissions(Permission.USER_UPDATE)
  async update(
    @Param('id') id: string, 
    @Body() userData: Partial<User>,
    @ActiveUser() user?: ActiveUserData
  ): Promise<User | null> {
    return this.usersService.update(id, userData, user?.sub);
  }

  /**
   * Archive user (soft delete)
   * @deprecated Use PATCH /users/:id with status: 'archived' instead
   */
  @Delete(':id')
  // @Roles('manager')
  // @Permissions(Permission.USER_DELETE)
  async remove(@Param('id') id: string, @ActiveUser() user?: ActiveUserData): Promise<void> {
    return this.usersService.remove(id, user?.sub);
  }

  @Patch(':id/role')
  // @Roles('admin', 'manager')
  // @Permissions(Permission.USER_UPDATE)
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<User | null> {
    try {
      // Валидация: проверяем что role передан
      if (!updateRoleDto.role) {
        throw new BadRequestException('Field "role" is required. Example: { "role": "cleaner" }');
      }
      
      console.log('🔄 Updating user role:', { userId: id, newRole: updateRoleDto.role });
      const updatedUser = await this.usersService.updateRole(id, updateRoleDto.role);
      
      if (!updatedUser) {
        throw new BadRequestException(`User with ID '${id}' not found`);
      }
      
      console.log('✅ Role updated successfully:', { userId: id, newRole: updatedUser?.role?.name });
      return updatedUser;
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      throw error;
    }
  }
}
