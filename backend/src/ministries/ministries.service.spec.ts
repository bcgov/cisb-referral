import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { MinistriesService } from './ministries.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '../generated/prisma/client';

const mockPrismaService = {
  ministry: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockAuditService = {
  logGlobal: jest.fn().mockResolvedValue(undefined),
};

const mockMinistry = {
  id: 'ministry-1',
  name: 'Test Ministry',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('MinistriesService', () => {
  let service: MinistriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinistriesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<MinistriesService>(MinistriesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all ministries ordered by name', async () => {
      mockPrismaService.ministry.findMany.mockResolvedValue([mockMinistry]);

      const result = await service.findAll();

      expect(result).toEqual([mockMinistry]);
      expect(mockPrismaService.ministry.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { name: 'asc' },
      });
    });

    it('should filter active only when activeOnly is true', async () => {
      mockPrismaService.ministry.findMany.mockResolvedValue([mockMinistry]);

      await service.findAll(true);

      expect(mockPrismaService.ministry.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return ministry when found', async () => {
      mockPrismaService.ministry.findUnique.mockResolvedValue(mockMinistry);

      const result = await service.findOne('ministry-1');

      expect(result).toEqual(mockMinistry);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.ministry.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a ministry', async () => {
      mockPrismaService.ministry.create.mockResolvedValue(mockMinistry);

      const result = await service.create(
        { name: 'Test Ministry' } as any,
        'admin-1',
      );

      expect(result).toEqual(mockMinistry);
      expect(mockPrismaService.ministry.create).toHaveBeenCalledWith({
        data: { name: 'Test Ministry' },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'ministry',
        recordId: 'ministry-1',
        action: 'CREATE',
        changes: [{ field: 'name', oldValue: null, newValue: 'Test Ministry' }],
        userId: 'admin-1',
      });
    });

    it('should throw ConflictException on duplicate name', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrismaService.ministry.create.mockRejectedValue(prismaError);

      await expect(
        service.create({ name: 'Duplicate' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-Prisma errors', async () => {
      mockPrismaService.ministry.create.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(service.create({ name: 'Test' } as any)).rejects.toThrow(
        'unexpected',
      );
    });
  });

  describe('update', () => {
    it('should update and return ministry', async () => {
      const updated = { ...mockMinistry, name: 'Updated Ministry' };
      mockPrismaService.ministry.findUnique.mockResolvedValue(mockMinistry);
      mockPrismaService.ministry.update.mockResolvedValue(updated);

      const result = await service.update(
        'ministry-1',
        {
          name: 'Updated Ministry',
        } as any,
        'admin-1',
      );

      expect(result.name).toBe('Updated Ministry');
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'ministry',
        recordId: 'ministry-1',
        action: 'UPDATE',
        changes: [
          {
            field: 'name',
            oldValue: 'Test Ministry',
            newValue: 'Updated Ministry',
          },
        ],
        userId: 'admin-1',
      });
    });

    it('should not log audit when no fields changed', async () => {
      mockPrismaService.ministry.findUnique.mockResolvedValue(mockMinistry);
      mockPrismaService.ministry.update.mockResolvedValue(mockMinistry);

      await service.update('ministry-1', {
        name: 'Test Ministry',
      } as any);

      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for nonexistent ministry', async () => {
      mockPrismaService.ministry.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockPrismaService.ministry.findUnique.mockResolvedValue(mockMinistry);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrismaService.ministry.update.mockRejectedValue(prismaError);

      await expect(
        service.update('ministry-1', { name: 'Duplicate' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete and return ministry', async () => {
      mockPrismaService.ministry.findUnique.mockResolvedValue(mockMinistry);
      mockPrismaService.ministry.delete.mockResolvedValue(mockMinistry);

      const result = await service.remove('ministry-1', 'admin-1');

      expect(result).toEqual(mockMinistry);
      expect(mockPrismaService.ministry.delete).toHaveBeenCalledWith({
        where: { id: 'ministry-1' },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'ministry',
        recordId: 'ministry-1',
        action: 'DELETE',
        changes: [],
        userId: 'admin-1',
      });
    });

    it('should throw NotFoundException for nonexistent ministry', async () => {
      mockPrismaService.ministry.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
