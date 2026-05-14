import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { diffObjects } from '../audit/audit.utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './dto/user.dto';
import { User } from '../generated/prisma/client';

const TRACKED_FIELDS = ['fullName', 'email', 'role', 'isActive'];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    currentUser: Pick<User, 'id' | 'role'>,
  ): Promise<User> {
    if (!createUserDto.email) {
      throw new BadRequestException('Email is required');
    }

    this.assertCanAssignRole(currentUser.role, createUserDto.role);

    const user = await this.prisma.user.create({
      data: {
        fullName: createUserDto.fullName,
        email: createUserDto.email.toLowerCase(),
        role: createUserDto.role,
        isActive: true,
      },
    });

    await this.auditService.logGlobal({
      tableName: 'user',
      recordId: user.id,
      action: 'CREATE',
      changes: [
        { field: 'fullName', oldValue: null, newValue: user.fullName },
        { field: 'email', oldValue: null, newValue: user.email },
        { field: 'role', oldValue: null, newValue: user.role },
      ],
      userId: currentUser.id,
    });

    return user;
  }

  async findAll(
    role?: UserRole,
    isActive?: boolean,
    currentUserRole?: string,
  ): Promise<User[]> {
    if (
      currentUserRole === UserRole.ADMIN &&
      role === UserRole.SYSTEM_ADMINISTRATOR
    ) {
      return [];
    }

    const roleFilter =
      role ??
      (currentUserRole === UserRole.ADMIN
        ? {
            in: [UserRole.USER, UserRole.ADMIN],
          }
        : undefined);

    return this.prisma.user.findMany({
      where: {
        role: roleFilter,
        isActive,
        deletedAt: null,
      },
      orderBy: {
        fullName: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: Pick<User, 'id' | 'role'>,
  ): Promise<User> {
    const existing = await this.findOne(id);

    if (updateUserDto.role) {
      this.assertCanAssignRole(currentUser.role, updateUserDto.role);
    }

    const data = { ...updateUserDto };
    if (data.email) {
      data.email = data.email.toLowerCase();
    }

    const changes = diffObjects(existing, data, TRACKED_FIELDS);

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    if (changes.length > 0) {
      await this.auditService.logGlobal({
        tableName: 'user',
        recordId: id,
        action: 'UPDATE',
        changes,
        userId: currentUser.id,
      });
    }

    return updated;
  }

  async remove(id: string, userId?: string): Promise<User> {
    await this.findOne(id);

    const removed = await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    await this.auditService.logGlobal({
      tableName: 'user',
      recordId: id,
      action: 'DELETE',
      changes: [],
      userId,
    });

    return removed;
  }

  private assertCanAssignRole(actingRole: string, targetRole: UserRole): void {
    if (actingRole === UserRole.SYSTEM_ADMINISTRATOR) {
      return;
    }

    if (
      actingRole === UserRole.ADMIN &&
      [UserRole.ADMIN, UserRole.USER].includes(targetRole)
    ) {
      return;
    }

    throw new ForbiddenException(
      'Insufficient permissions to assign the requested role',
    );
  }
}
