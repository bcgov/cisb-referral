import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from './audit.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  auditLog: {
    create: jest.fn().mockResolvedValue(undefined),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  referralAuditLog: {
    create: jest.fn().mockResolvedValue(undefined),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    findMany: jest.fn(),
  },
};

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  describe('logGlobal', () => {
    it('should create a single entry when no changes provided', async () => {
      await service.logGlobal({
        tableName: 'user',
        recordId: 'user-1',
        action: 'DELETE',
        userId: 'admin-1',
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          tableName: 'user',
          recordId: 'user-1',
          action: 'DELETE',
          createdBy: 'admin-1',
        },
      });
      expect(mockPrismaService.auditLog.createMany).not.toHaveBeenCalled();
    });

    it('should create a single entry when changes is empty', async () => {
      await service.logGlobal({
        tableName: 'ministry',
        recordId: 'ministry-1',
        action: 'DELETE',
        changes: [],
        userId: 'admin-1',
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          tableName: 'ministry',
          recordId: 'ministry-1',
          action: 'DELETE',
          createdBy: 'admin-1',
        },
      });
      expect(mockPrismaService.auditLog.createMany).not.toHaveBeenCalled();
    });

    it('should create multiple entries when changes are provided', async () => {
      await service.logGlobal({
        tableName: 'user',
        recordId: 'user-1',
        action: 'CREATE',
        changes: [
          { field: 'fullName', oldValue: null, newValue: 'Test User' },
          { field: 'email', oldValue: null, newValue: 'test@test.com' },
        ],
        userId: 'admin-1',
      });

      expect(mockPrismaService.auditLog.createMany).toHaveBeenCalledWith({
        data: [
          {
            tableName: 'user',
            recordId: 'user-1',
            action: 'CREATE',
            field: 'fullName',
            oldValue: null,
            newValue: 'Test User',
            createdBy: 'admin-1',
          },
          {
            tableName: 'user',
            recordId: 'user-1',
            action: 'CREATE',
            field: 'email',
            oldValue: null,
            newValue: 'test@test.com',
            createdBy: 'admin-1',
          },
        ],
      });
      expect(mockPrismaService.auditLog.create).not.toHaveBeenCalled();
    });

    it('should handle missing userId', async () => {
      await service.logGlobal({
        tableName: 'region',
        recordId: 'region-1',
        action: 'DELETE',
        changes: [],
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith({
        data: {
          tableName: 'region',
          recordId: 'region-1',
          action: 'DELETE',
          createdBy: undefined,
        },
      });
    });
  });

  describe('logReferralChange', () => {
    it('should create a single entry when no changes provided', async () => {
      await service.logReferralChange({
        referralId: 'referral-1',
        action: 'CREATE',
      });

      expect(mockPrismaService.referralAuditLog.create).toHaveBeenCalledWith({
        data: {
          referralId: 'referral-1',
          action: 'CREATE',
          createdBy: undefined,
        },
      });
      expect(
        mockPrismaService.referralAuditLog.createMany,
      ).not.toHaveBeenCalled();
    });

    it('should create multiple entries when changes are provided', async () => {
      await service.logReferralChange({
        referralId: 'referral-1',
        action: 'UPDATE',
        changes: [
          { field: 'assignedToId', oldValue: null, newValue: 'user-1' },
        ],
        userId: 'admin-1',
      });

      expect(
        mockPrismaService.referralAuditLog.createMany,
      ).toHaveBeenCalledWith({
        data: [
          {
            referralId: 'referral-1',
            action: 'UPDATE',
            field: 'assignedToId',
            oldValue: null,
            newValue: 'user-1',
            createdBy: 'admin-1',
          },
        ],
      });
      expect(mockPrismaService.referralAuditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('findGlobalLogs', () => {
    it('should return paginated results with metadata', async () => {
      const mockLogs = [{ id: 'log-1', tableName: 'user', action: 'CREATE' }];
      mockPrismaService.auditLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.auditLog.count.mockResolvedValue(1);

      const result = await service.findGlobalLogs({ page: 1, limit: 50 });

      expect(result.data).toEqual(mockLogs);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, fullName: true } } },
      });
    });

    it('should filter by tableName', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(0);

      await service.findGlobalLogs({ tableName: 'user' });

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tableName: 'user' },
        }),
      );
    });

    it('should calculate correct pagination offset', async () => {
      mockPrismaService.auditLog.findMany.mockResolvedValue([]);
      mockPrismaService.auditLog.count.mockResolvedValue(100);

      const result = await service.findGlobalLogs({ page: 3, limit: 10 });

      expect(mockPrismaService.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
      expect(result.meta.totalPages).toBe(10);
    });
  });

  describe('findReferralLogs', () => {
    it('should return audit logs for a referral', async () => {
      const mockLogs = [
        { id: 'log-1', referralId: 'referral-1', action: 'CREATE' },
      ];
      mockPrismaService.referralAuditLog.findMany.mockResolvedValue(mockLogs);

      const result = await service.findReferralLogs('referral-1');

      expect(result).toEqual(mockLogs);
      expect(mockPrismaService.referralAuditLog.findMany).toHaveBeenCalledWith({
        where: { referralId: 'referral-1' },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, fullName: true } } },
      });
    });
  });
});
