import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../generated/prisma/client';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const mockAuditService = {
  logGlobal: jest.fn().mockResolvedValue(undefined),
};

const mockUser = {
  id: 'user-1',
  fullName: 'Test User',
  email: 'test@test.com',
  role: UserRole.ADMIN,
  isActive: true,
  deletedAt: null,
  createdAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user with correct data', async () => {
      const dto = {
        fullName: 'Test User',
        email: 'test@test.com',
        role: UserRole.ADMIN,
      };
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(
        dto as any,
        {
          id: 'admin-1',
          role: UserRole.ADMIN,
        } as any,
      );

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'Test User',
          email: 'test@test.com',
          role: UserRole.ADMIN,
          isActive: true,
        },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'user',
        recordId: 'user-1',
        action: 'CREATE',
        changes: [
          { field: 'fullName', oldValue: null, newValue: 'Test User' },
          { field: 'email', oldValue: null, newValue: 'test@test.com' },
          { field: 'role', oldValue: null, newValue: UserRole.ADMIN },
        ],
        userId: 'admin-1',
      });
    });

    it('should throw BadRequestException when email is missing', async () => {
      const dto = { fullName: 'Test User' };

      await expect(
        service.create(
          dto as any,
          { id: 'admin-1', role: UserRole.ADMIN } as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when admin creates system administrator', async () => {
      const dto = {
        fullName: 'System Admin User',
        email: 'sysadmin@test.com',
        role: UserRole.SYSTEM_ADMINISTRATOR,
      };

      await expect(
        service.create(
          dto as any,
          { id: 'admin-1', role: UserRole.ADMIN } as any,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should allow system admin to create system administrator', async () => {
      const dto = {
        fullName: 'System Admin User',
        email: 'sysadmin@test.com',
        role: UserRole.SYSTEM_ADMINISTRATOR,
      };
      const createdUser = {
        ...mockUser,
        id: 'user-2',
        fullName: 'System Admin User',
        email: 'sysadmin@test.com',
        role: UserRole.SYSTEM_ADMINISTRATOR,
      };
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.create(
        dto as any,
        {
          id: 'sysadmin-1',
          role: UserRole.SYSTEM_ADMINISTRATOR,
        } as any,
      );

      expect(result).toEqual(createdUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'System Admin User',
          email: 'sysadmin@test.com',
          role: UserRole.SYSTEM_ADMINISTRATOR,
          isActive: true,
        },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'user',
        recordId: 'user-2',
        action: 'CREATE',
        changes: [
          {
            field: 'fullName',
            oldValue: null,
            newValue: 'System Admin User',
          },
          { field: 'email', oldValue: null, newValue: 'sysadmin@test.com' },
          {
            field: 'role',
            oldValue: null,
            newValue: UserRole.SYSTEM_ADMINISTRATOR,
          },
        ],
        userId: 'sysadmin-1',
      });
    });
  });

  describe('findAll', () => {
    it('should return all active users ordered by name', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll(
        undefined,
        undefined,
        UserRole.SYSTEM_ADMINISTRATOR,
      );

      expect(result).toEqual([mockUser]);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: undefined,
          isActive: undefined,
          deletedAt: null,
        },
        orderBy: { fullName: 'asc' },
      });
    });

    it('should filter by role', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll(
        UserRole.ADMIN,
        undefined,
        UserRole.SYSTEM_ADMINISTRATOR,
      );

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: UserRole.ADMIN }),
        }),
      );
    });

    it('should filter by isActive', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll(undefined, true, UserRole.SYSTEM_ADMINISTRATOR);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });

    it('should exclude system administrators for admin callers', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll(undefined, undefined, UserRole.ADMIN);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: { in: [UserRole.USER, UserRole.ADMIN] },
          isActive: undefined,
          deletedAt: null,
        },
        orderBy: { fullName: 'asc' },
      });
    });

    it('should exclude system administrators for non-system-admin callers', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll(undefined, undefined, UserRole.USER);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          role: { in: [UserRole.USER, UserRole.ADMIN] },
          isActive: undefined,
          deletedAt: null,
        },
        orderBy: { fullName: 'asc' },
      });
    });

    it('should return empty result when admin requests system administrators', async () => {
      const result = await service.findAll(
        UserRole.SYSTEM_ADMINISTRATOR,
        undefined,
        UserRole.ADMIN,
      );

      expect(result).toEqual([]);
      expect(mockPrismaService.user.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-1', deletedAt: null },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updated = { ...mockUser, fullName: 'Updated User' };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updated);

      const result = await service.update(
        'user-1',
        {
          fullName: 'Updated User',
        } as any,
        { id: 'admin-1', role: UserRole.ADMIN } as any,
      );

      expect(result.fullName).toBe('Updated User');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { fullName: 'Updated User' },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'user',
        recordId: 'user-1',
        action: 'UPDATE',
        changes: [
          {
            field: 'fullName',
            oldValue: 'Test User',
            newValue: 'Updated User',
          },
        ],
        userId: 'admin-1',
      });
    });

    it('should not log audit when no fields changed', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.update(
        'user-1',
        {
          fullName: 'Test User',
        } as any,
        {
          id: 'admin-1',
          role: UserRole.ADMIN,
        } as any,
      );

      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for nonexistent user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.update(
          'nonexistent',
          {} as any,
          {
            id: 'admin-1',
            role: UserRole.ADMIN,
          } as any,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when admin updates role to system administrator', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.update(
          'user-1',
          { role: UserRole.SYSTEM_ADMINISTRATOR } as any,
          { id: 'admin-1', role: UserRole.ADMIN } as any,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when admin updates a system administrator without role change', async () => {
      const systemAdmin = {
        ...mockUser,
        role: UserRole.SYSTEM_ADMINISTRATOR,
      };
      mockPrismaService.user.findFirst.mockResolvedValue(systemAdmin);

      await expect(
        service.update(
          'user-1',
          { fullName: 'Updated User' } as any,
          { id: 'admin-1', role: UserRole.ADMIN } as any,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should allow system admin to update another system administrator', async () => {
      const systemAdmin = {
        ...mockUser,
        id: 'sysadmin-2',
        role: UserRole.SYSTEM_ADMINISTRATOR,
      };
      const updated = { ...systemAdmin, fullName: 'Updated SysAdmin' };
      mockPrismaService.user.findFirst.mockResolvedValue(systemAdmin);
      mockPrismaService.user.update.mockResolvedValue(updated);

      const result = await service.update(
        'sysadmin-2',
        { fullName: 'Updated SysAdmin' } as any,
        {
          id: 'sysadmin-1',
          role: UserRole.SYSTEM_ADMINISTRATOR,
        } as any,
      );

      expect(result.fullName).toBe('Updated SysAdmin');
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user changes their own role', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        service.update(
          'user-1',
          { role: UserRole.USER } as any,
          { id: 'user-1', role: UserRole.ADMIN } as any,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      const deleted = { ...mockUser, isActive: false, deletedAt: new Date() };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(deleted);

      const result = await service.remove('user-1', {
        id: 'admin-1',
        role: UserRole.ADMIN,
      } as any);

      expect(result.isActive).toBe(false);
      expect(result.deletedAt).toBeDefined();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          deletedAt: expect.any(Date),
          isActive: false,
        },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'user',
        recordId: 'user-1',
        action: 'DELETE',
        changes: [],
        userId: 'admin-1',
      });
    });

    it('should throw ForbiddenException when admin deletes a system administrator', async () => {
      const systemAdmin = {
        ...mockUser,
        role: UserRole.SYSTEM_ADMINISTRATOR,
      };
      mockPrismaService.user.findFirst.mockResolvedValue(systemAdmin);

      await expect(
        service.remove('user-1', {
          id: 'admin-1',
          role: UserRole.ADMIN,
        } as any),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should allow system admin to delete another system administrator', async () => {
      const systemAdmin = {
        ...mockUser,
        id: 'sysadmin-2',
        role: UserRole.SYSTEM_ADMINISTRATOR,
      };
      const deleted = {
        ...systemAdmin,
        isActive: false,
        deletedAt: new Date(),
      };
      mockPrismaService.user.findFirst.mockResolvedValue(systemAdmin);
      mockPrismaService.user.update.mockResolvedValue(deleted);

      const result = await service.remove('sysadmin-2', {
        id: 'sysadmin-1',
        role: UserRole.SYSTEM_ADMINISTRATOR,
      } as any);

      expect(result.isActive).toBe(false);
      expect(result.deletedAt).toBeDefined();
      expect(mockPrismaService.user.update).toHaveBeenCalled();
      expect(mockAuditService.logGlobal).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user deletes themselves', async () => {
      await expect(
        service.remove('user-1', {
          id: 'user-1',
          role: UserRole.ADMIN,
        } as any),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrismaService.user.findFirst).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for nonexistent user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('nonexistent', {
          id: 'admin-1',
          role: UserRole.ADMIN,
        } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
