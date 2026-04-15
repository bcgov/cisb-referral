import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

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
  role: 'ADMIN',
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
        role: 'ADMIN',
      };
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(dto as any, 'admin-1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'Test User',
          email: 'test@test.com',
          role: 'ADMIN',
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
          { field: 'role', oldValue: null, newValue: 'ADMIN' },
        ],
        userId: 'admin-1',
      });
    });

    it('should throw BadRequestException when email is missing', async () => {
      const dto = { fullName: 'Test User' };

      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all active users ordered by name', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

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

      await service.findAll('ADMIN' as any);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'ADMIN' }),
        }),
      );
    });

    it('should filter by isActive', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      await service.findAll(undefined, true);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
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
        'admin-1',
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

      await service.update('user-1', {
        fullName: 'Test User',
      } as any);

      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for nonexistent user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      const deleted = { ...mockUser, isActive: false, deletedAt: new Date() };
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(deleted);

      const result = await service.remove('user-1', 'admin-1');

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

    it('should throw NotFoundException for nonexistent user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
