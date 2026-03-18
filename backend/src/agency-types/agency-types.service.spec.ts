import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AgencyTypesService } from './agency-types.service';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

const mockPrismaService = {
  agencyType: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockAgencyType = {
  id: 'agency-type-1',
  name: 'Test Agency Type',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AgencyTypesService', () => {
  let service: AgencyTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyTypesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AgencyTypesService>(AgencyTypesService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all agency types ordered by name', async () => {
      mockPrismaService.agencyType.findMany.mockResolvedValue([mockAgencyType]);

      const result = await service.findAll();

      expect(result).toEqual([mockAgencyType]);
      expect(mockPrismaService.agencyType.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { name: 'asc' },
      });
    });

    it('should filter active only when activeOnly is true', async () => {
      mockPrismaService.agencyType.findMany.mockResolvedValue([mockAgencyType]);

      await service.findAll(true);

      expect(mockPrismaService.agencyType.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return agency type when found', async () => {
      mockPrismaService.agencyType.findUnique.mockResolvedValue(mockAgencyType);

      const result = await service.findOne('agency-type-1');

      expect(result).toEqual(mockAgencyType);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.agencyType.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return an agency type', async () => {
      mockPrismaService.agencyType.create.mockResolvedValue(mockAgencyType);

      const result = await service.create({
        name: 'Test Agency Type',
      } as any);

      expect(result).toEqual(mockAgencyType);
      expect(mockPrismaService.agencyType.create).toHaveBeenCalledWith({
        data: { name: 'Test Agency Type' },
      });
    });

    it('should throw ConflictException on duplicate name', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrismaService.agencyType.create.mockRejectedValue(prismaError);

      await expect(
        service.create({ name: 'Duplicate' } as any),
      ).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-Prisma errors', async () => {
      mockPrismaService.agencyType.create.mockRejectedValue(
        new Error('unexpected'),
      );

      await expect(service.create({ name: 'Test' } as any)).rejects.toThrow(
        'unexpected',
      );
    });
  });

  describe('update', () => {
    it('should update and return agency type', async () => {
      const updated = { ...mockAgencyType, name: 'Updated Agency Type' };
      mockPrismaService.agencyType.findUnique.mockResolvedValue(mockAgencyType);
      mockPrismaService.agencyType.update.mockResolvedValue(updated);

      const result = await service.update('agency-type-1', {
        name: 'Updated Agency Type',
      } as any);

      expect(result.name).toBe('Updated Agency Type');
    });

    it('should throw NotFoundException for nonexistent agency type', async () => {
      mockPrismaService.agencyType.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
      mockPrismaService.agencyType.findUnique.mockResolvedValue(mockAgencyType);
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '6.0.0' },
      );
      mockPrismaService.agencyType.update.mockRejectedValue(prismaError);

      await expect(
        service.update('agency-type-1', { name: 'Duplicate' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete and return agency type', async () => {
      mockPrismaService.agencyType.findUnique.mockResolvedValue(mockAgencyType);
      mockPrismaService.agencyType.delete.mockResolvedValue(mockAgencyType);

      const result = await service.remove('agency-type-1');

      expect(result).toEqual(mockAgencyType);
      expect(mockPrismaService.agencyType.delete).toHaveBeenCalledWith({
        where: { id: 'agency-type-1' },
      });
    });

    it('should throw NotFoundException for nonexistent agency type', async () => {
      mockPrismaService.agencyType.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
