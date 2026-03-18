import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { RegionsService } from './regions.service';
import { PrismaService } from '../prisma/prisma.service';
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

      const result = await service.create({ name: 'Test Region' });

      expect(result).toEqual(mockRegion);
      expect(mockPrismaService.region.create).toHaveBeenCalledWith({
        data: { name: 'Test Region' },
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

      const result = await service.update('region-1', {
        name: 'Updated Region',
      });

      expect(result.name).toBe('Updated Region');
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

      const result = await service.remove('region-1');

      expect(result).toEqual(mockRegion);
      expect(mockPrismaService.region.delete).toHaveBeenCalledWith({
        where: { id: 'region-1' },
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
