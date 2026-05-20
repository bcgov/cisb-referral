import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseEnumPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import {
  UserRole as PrismaUserRole,
  type User,
  type UserRole,
} from '../generated/prisma/client';
import { AdminAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';

@ApiTags('users')
@ApiBearerAuth()
@Controller({ path: 'users', version: '1' })
@UseGuards(AdminAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Current user details',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() currentUser: User): User {
    return currentUser;
  }

  @Post()
  @Roles(PrismaUserRole.ADMIN, PrismaUserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    return this.usersService.create(createUserDto, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }

  @Get()
  @Roles(PrismaUserRole.ADMIN, PrismaUserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: PrismaUserRole,
    description: 'Filter by role',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserDto] })
  async findAll(
    @Query('role', new ParseEnumPipe(PrismaUserRole, { optional: true }))
    role: UserRole | undefined,
    @Query('isActive') isActive: string | undefined,
    @CurrentUser() currentUser: User,
  ): Promise<User[]> {
    let active: boolean | undefined;
    if (isActive === 'true') {
      active = true;
    } else if (isActive === 'false') {
      active = false;
    }
    return this.usersService.findAll(role, active, currentUser.role);
  }

  @Get(':id')
  @Roles(PrismaUserRole.ADMIN, PrismaUserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details', type: UserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(PrismaUserRole.ADMIN, PrismaUserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }

  @Delete(':id')
  @Roles(PrismaUserRole.ADMIN, PrismaUserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ): Promise<User> {
    return this.usersService.remove(id, {
      id: currentUser.id,
      role: currentUser.role,
    });
  }
}
