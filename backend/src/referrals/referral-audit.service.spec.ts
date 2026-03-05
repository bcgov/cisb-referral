import { Test, TestingModule } from '@nestjs/testing';
import { ReferralAuditService, AuditChange } from './referral-audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '../generated/prisma/client';

describe('ReferralAuditService', () => {
  let service: ReferralAuditService;

  /**
   * Factory for creating a test audit log entry with dynamic defaults
   */
  const createTestAuditEntry = (overrides = {}) => ({
    id: crypto.randomUUID(),
    referralId: crypto.randomUUID(),
    action: AuditAction.UPDATE,
    fieldChanged: 'referralStatus',
    oldValue: 'OPEN',
    newValue: 'ASSIGNED',
    comment: null,
    changedBy: crypto.randomUUID(),
    changedByUser: { id: crypto.randomUUID(), fullName: 'Test User' },
    changedAt: new Date(),
    ...overrides,
  });

  /**
   * Factory for creating a test audit change
   */
  const createTestChange = (
    overrides: Partial<AuditChange> = {},
  ): AuditChange => ({
    field: 'referralStatus',
    oldValue: 'OPEN',
    newValue: 'ASSIGNED',
    ...overrides,
  });

  const mockPrismaService = {
    referralAuditLog: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralAuditService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReferralAuditService>(ReferralAuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAuditEntries', () => {
    it('should not insert rows when changes array is empty', async () => {
      // Arrange
      const referralId = crypto.randomUUID();

      // Act
      await service.createAuditEntries(
        referralId,
        AuditAction.UPDATE,
        [],
        crypto.randomUUID(),
      );

      // Assert
      expect(
        mockPrismaService.referralAuditLog.createMany,
      ).not.toHaveBeenCalled();
    });

    it('should bulk-insert entries for each change', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const changes: AuditChange[] = [
        createTestChange({
          field: 'referralStatus',
          oldValue: 'OPEN',
          newValue: 'ASSIGNED',
        }),
        createTestChange({
          field: 'assignedToId',
          oldValue: null,
          newValue: crypto.randomUUID(),
        }),
      ];
      mockPrismaService.referralAuditLog.createMany.mockResolvedValue({
        count: 2,
      });

      // Act
      await service.createAuditEntries(
        referralId,
        AuditAction.UPDATE,
        changes,
        userId,
      );

      // Assert
      expect(
        mockPrismaService.referralAuditLog.createMany,
      ).toHaveBeenCalledWith({
        data: [
          {
            referralId,
            action: AuditAction.UPDATE,
            fieldChanged: 'referralStatus',
            oldValue: 'OPEN',
            newValue: 'ASSIGNED',
            changedBy: userId,
          },
          {
            referralId,
            action: AuditAction.UPDATE,
            fieldChanged: 'assignedToId',
            oldValue: null,
            newValue: changes[1].newValue,
            changedBy: userId,
          },
        ],
      });
    });

    it('should support CREATE action for new referrals', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const changes: AuditChange[] = [
        createTestChange({
          field: 'referralStatus',
          oldValue: null,
          newValue: 'OPEN',
        }),
      ];
      mockPrismaService.referralAuditLog.createMany.mockResolvedValue({
        count: 1,
      });

      // Act
      await service.createAuditEntries(
        referralId,
        AuditAction.CREATE,
        changes,
        userId,
      );

      // Assert
      expect(
        mockPrismaService.referralAuditLog.createMany,
      ).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            action: AuditAction.CREATE,
            fieldChanged: 'referralStatus',
            oldValue: null,
            newValue: 'OPEN',
          }),
        ],
      });
    });

    it('should handle entries without a userId', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const changes: AuditChange[] = [createTestChange()];
      mockPrismaService.referralAuditLog.createMany.mockResolvedValue({
        count: 1,
      });

      // Act
      await service.createAuditEntries(referralId, AuditAction.UPDATE, changes);

      // Assert
      expect(
        mockPrismaService.referralAuditLog.createMany,
      ).toHaveBeenCalledWith({
        data: [expect.objectContaining({ changedBy: undefined })],
      });
    });
  });

  describe('findByReferralId', () => {
    it('should return paginated audit entries ordered by changedAt desc', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const entries = [
        createTestAuditEntry({ referralId }),
        createTestAuditEntry({ referralId }),
      ];
      mockPrismaService.referralAuditLog.findMany.mockResolvedValue(entries);
      mockPrismaService.referralAuditLog.count.mockResolvedValue(2);

      // Act
      const result = await service.findByReferralId(referralId);

      // Assert
      expect(result.data).toEqual(entries);
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
      expect(mockPrismaService.referralAuditLog.findMany).toHaveBeenCalledWith({
        where: { referralId },
        skip: 0,
        take: 50,
        orderBy: { changedAt: 'desc' },
        include: {
          changedByUser: { select: { id: true, fullName: true } },
        },
      });
    });

    it('should apply pagination parameters correctly', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      mockPrismaService.referralAuditLog.findMany.mockResolvedValue([]);
      mockPrismaService.referralAuditLog.count.mockResolvedValue(75);

      // Act
      const result = await service.findByReferralId(referralId, 2, 25);

      // Assert
      expect(result.meta).toEqual({
        total: 75,
        page: 2,
        limit: 25,
        totalPages: 3,
      });
      expect(mockPrismaService.referralAuditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 25, take: 25 }),
      );
    });

    it('should return empty data when no audit entries exist', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      mockPrismaService.referralAuditLog.findMany.mockResolvedValue([]);
      mockPrismaService.referralAuditLog.count.mockResolvedValue(0);

      // Act
      const result = await service.findByReferralId(referralId);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
