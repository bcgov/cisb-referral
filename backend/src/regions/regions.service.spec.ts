import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Prisma } from '../generated/prisma/client';

const mockPrismaService = {
  region: {
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

const mockRegion = {
  id: 'region-1',
  name: 'Test Region',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('RegionsService', () => {
  let service: RegionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegionsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<RegionsService>(RegionsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all regions ordered by name', async () => {
      mockPrismaService.region.findMany.mockResolvedValue([mockRegion]);

      const result = await service.findAll();

      expect(result).toEqual([mockRegion]);
      expect(mockPrismaService.region.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findAllLookup', () => {
    it('should select only id and name', async () => {
      const rows = [{ id: 'region-1', name: 'Test Region' }];
      mockPrismaService.region.findMany.mockResolvedValue(rows);

      const result = await service.findAllLookup();

      expect(result).toEqual(rows);
      expect(mockPrismaService.region.findMany).toHaveBeenCalledWith({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return region when found', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);

      const result = await service.findOne('region-1');

      expect(result).toEqual(mockRegion);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a region', async () => {
      mockPrismaService.region.create.mockResolvedValue(mockRegion);

      const result = await service.create({ name: 'Test Region' }, 'admin-1');

      expect(result).toEqual(mockRegion);
      expect(mockPrismaService.region.create).toHaveBeenCalledWith({
        data: { name: 'Test Region' },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'region',
        recordId: 'region-1',
        action: 'CREATE',
        changes: [{ field: 'name', oldValue: null, newValue: 'Test Region' }],
        userId: 'admin-1',
      });
    });

    it('should throw ConflictException on duplicate name', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrismaService.region.create.mockRejectedValue(prismaError);

      await expect(
        service.create({ name: 'Duplicate Region' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-Prisma errors', async () => {
      mockPrismaService.region.create.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(service.create({ name: 'Test Region' })).rejects.toThrow(
        'unexpected',
      );
    });
  });

  describe('update', () => {
    it('should update and return region', async () => {
      const updated = { ...mockRegion, name: 'Updated Region' };
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      mockPrismaService.region.update.mockResolvedValue(updated);

      const result = await service.update(
        'region-1',
        {
          name: 'Updated Region',
        },
        'admin-1',
      );

      expect(result.name).toBe('Updated Region');
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'region',
        recordId: 'region-1',
        action: 'UPDATE',
        changes: [
          {
            field: 'name',
            oldValue: 'Test Region',
            newValue: 'Updated Region',
          },
        ],
        userId: 'admin-1',
      });
    });

    it('should not log audit when no fields changed', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      mockPrismaService.region.update.mockResolvedValue(mockRegion);

      await service.update('region-1', {
        name: 'Test Region',
      });

      expect(mockAuditService.logGlobal).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for nonexistent region', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrismaService.region.update.mockRejectedValue(prismaError);

      await expect(
        service.update('region-1', { name: 'Duplicate' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete and return region', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(mockRegion);
      mockPrismaService.region.delete.mockResolvedValue(mockRegion);

      const result = await service.remove('region-1', 'admin-1');

      expect(result).toEqual(mockRegion);
      expect(mockPrismaService.region.delete).toHaveBeenCalledWith({
        where: { id: 'region-1' },
      });
      expect(mockAuditService.logGlobal).toHaveBeenCalledWith({
        tableName: 'region',
        recordId: 'region-1',
        action: 'DELETE',
        changes: [],
        userId: 'admin-1',
      });
    });

    it('should throw NotFoundException for nonexistent region', async () => {
      mockPrismaService.region.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
