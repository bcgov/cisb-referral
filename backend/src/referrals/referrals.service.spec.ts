import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralAuditService } from './referral-audit.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  AuditAction,
  ReferralStatus as PrismaReferralStatus,
} from '../generated/prisma/client';
import { ReferralStatus } from './dto/update-referral.dto';
import { SupportType } from './dto/create-referral.dto';
import type { Referral } from '../generated/prisma/client';

describe('ReferralsService', () => {
  let service: ReferralsService;

  /**
   * Factory for creating a test referral with dynamic defaults
   */
  const createTestReferral = (overrides: Partial<Referral> = {}): Referral =>
    ({
      id: crypto.randomUUID(),
      referralStatus: PrismaReferralStatus.OPEN,
      referralOutcome: null,
      assignedToId: null,
      communityPartnerName: null,
      flag: false,
      followUpDate: null,
      dueDate: null,
      completedDate: null,
      assignedOn: null,
      firstContactMadeOn: null,
      regionId: crypto.randomUUID(),
      specificCityTown: null,
      currentlyConnectedSupports: [],
      currentlyConnectedSupportsOther: null,
      neededSupports: [],
      neededSupportsOther: null,
      referralSummary: null,
      referredBy: null,
      ministryId: null,
      ministryNameOther: null,
      agencyTypeId: null,
      agencyTypeOther: null,
      partnerAgencyName: null,
      programArea: null,
      referrerContactName: 'Test Referrer',
      referrerEmail: 'referrer@example.com',
      referrerPhone: null,
      individualFirstName: 'Jane',
      individualMiddleName: null,
      individualLastName: 'Doe',
      individualPreferredName: null,
      individualDateOfBirth: null,
      individualPhone: null,
      gainFile: null,
      secondaryContact: null,
      bestWayToReach: null,
      currentlyHomeless: null,
      losingHousing: null,
      pendingRelease: null,
      releaseDate: null,
      modifiedBy: null,
      createdBy: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    }) as Referral;

  const mockPrismaService = {
    referral: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    ministry: { findUnique: jest.fn() },
    region: { findUnique: jest.fn() },
    agencyType: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
  };

  const mockAuditService = {
    createAuditEntries: jest.fn(),
    findByReferralId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ReferralAuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectChanges', () => {
    it('should detect a single scalar field change', () => {
      // Arrange
      const existing = createTestReferral({
        referralStatus: PrismaReferralStatus.OPEN,
      });
      const dto = { referralStatus: ReferralStatus.ASSIGNED };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([
        { field: 'referralStatus', oldValue: 'OPEN', newValue: 'ASSIGNED' },
      ]);
    });

    it('should detect multiple field changes at once', () => {
      // Arrange
      const assignedToId = crypto.randomUUID();
      const existing = createTestReferral({
        referralStatus: PrismaReferralStatus.OPEN,
        specificCityTown: 'Victoria',
      });
      const dto = {
        referralStatus: ReferralStatus.ASSIGNED,
        assignedToId,
        specificCityTown: 'Vancouver',
      };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toHaveLength(3);
      expect(changes).toEqual(
        expect.arrayContaining([
          { field: 'referralStatus', oldValue: 'OPEN', newValue: 'ASSIGNED' },
          { field: 'assignedToId', oldValue: null, newValue: assignedToId },
          {
            field: 'specificCityTown',
            oldValue: 'Victoria',
            newValue: 'Vancouver',
          },
        ]),
      );
    });

    it('should return empty array when no fields are changed', () => {
      // Arrange
      const existing = createTestReferral({
        referralStatus: PrismaReferralStatus.OPEN,
        specificCityTown: 'Victoria',
      });
      const dto = {
        referralStatus: ReferralStatus.OPEN,
        specificCityTown: 'Victoria',
      };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([]);
    });

    it('should skip undefined fields in the DTO', () => {
      // Arrange
      const existing = createTestReferral({
        referralStatus: PrismaReferralStatus.OPEN,
      });
      const dto = {
        referralStatus: undefined,
        specificCityTown: 'Vancouver',
      };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([
        { field: 'specificCityTown', oldValue: null, newValue: 'Vancouver' },
      ]);
    });

    it('should exclude modifiedBy from audit changes', () => {
      // Arrange
      const existing = createTestReferral();
      const dto = { modifiedBy: crypto.randomUUID() } as Record<
        string,
        unknown
      >;

      // Act
      const changes = service.detectChanges(existing, dto as never);

      // Assert
      expect(changes).toEqual([]);
    });

    it('should compare date fields using ISO date strings', () => {
      // Arrange
      const existing = createTestReferral({
        followUpDate: new Date('2025-06-15T00:00:00.000Z'),
      });
      const dto = { followUpDate: '2025-07-01' };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([
        {
          field: 'followUpDate',
          oldValue: '2025-06-15',
          newValue: '2025-07-01',
        },
      ]);
    });

    it('should not detect a change when date value is the same', () => {
      // Arrange
      const existing = createTestReferral({
        dueDate: new Date('2025-08-01T00:00:00.000Z'),
      });
      const dto = { dueDate: '2025-08-01' };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([]);
    });

    it('should detect a change when date goes from null to a value', () => {
      // Arrange
      const existing = createTestReferral({ completedDate: null });
      const dto = { completedDate: '2025-09-15' };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([
        { field: 'completedDate', oldValue: null, newValue: '2025-09-15' },
      ]);
    });

    it('should compare array fields via sorted JSON', () => {
      // Arrange
      const existing = createTestReferral({
        currentlyConnectedSupports: [
          SupportType.HOUSING,
          SupportType.INCOME_ASSISTANCE_PROVINCIAL,
        ] as SupportType[],
      });
      const dto = {
        currentlyConnectedSupports: [
          SupportType.INCOME_ASSISTANCE_PROVINCIAL,
          SupportType.HOUSING,
          SupportType.HEALTH_SERVICES,
        ],
      };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([
        {
          field: 'currentlyConnectedSupports',
          oldValue: 'HOUSING, INCOME_ASSISTANCE_PROVINCIAL',
          newValue: 'HEALTH_SERVICES, HOUSING, INCOME_ASSISTANCE_PROVINCIAL',
        },
      ]);
    });

    it('should not detect a change when array contents are identical (different order)', () => {
      // Arrange
      const existing = createTestReferral({
        neededSupports: [
          SupportType.INCOME_ASSISTANCE_PROVINCIAL,
          SupportType.HEALTH_SERVICES,
        ] as SupportType[],
      });
      const dto = {
        neededSupports: [
          SupportType.HEALTH_SERVICES,
          SupportType.INCOME_ASSISTANCE_PROVINCIAL,
        ],
      };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([]);
    });

    it('should detect a change from null to a non-null scalar', () => {
      // Arrange
      const existing = createTestReferral({ communityPartnerName: null });
      const dto = { communityPartnerName: 'Partner Org' };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([
        {
          field: 'communityPartnerName',
          oldValue: null,
          newValue: 'Partner Org',
        },
      ]);
    });

    it('should detect a boolean field change', () => {
      // Arrange
      const existing = createTestReferral({ flag: false });
      const dto = { flag: true };

      // Act
      const changes = service.detectChanges(existing, dto);

      // Assert
      expect(changes).toEqual([
        { field: 'flag', oldValue: 'false', newValue: 'true' },
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a referral when found', async () => {
      // Arrange
      const referral = createTestReferral();
      mockPrismaService.referral.findUnique.mockResolvedValue(referral);

      // Act
      const result = await service.findOne(referral.id);

      // Assert
      expect(result).toEqual(referral);
      expect(mockPrismaService.referral.findUnique).toHaveBeenCalledWith({
        where: { id: referral.id },
        include: {
          region: true,
          ministry: true,
          agencyType: true,
          assignedTo: true,
        },
      });
    });

    it('should throw NotFoundException when referral not found', async () => {
      // Arrange
      const id = crypto.randomUUID();
      mockPrismaService.referral.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update referral and create audit entries', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const userEmail = 'admin@gov.bc.ca';
      const existing = createTestReferral({
        id: referralId,
        referralStatus: PrismaReferralStatus.OPEN,
      });
      const updated = createTestReferral({
        id: referralId,
        referralStatus: PrismaReferralStatus.ASSIGNED,
      });
      const dto = { referralStatus: ReferralStatus.ASSIGNED };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(updated);

      // Act
      const result = await service.update(referralId, dto, userId, userEmail);

      // Assert
      expect(result).toEqual(updated);
      expect(mockAuditService.createAuditEntries).toHaveBeenCalledWith(
        referralId,
        AuditAction.UPDATE,
        [{ field: 'referralStatus', oldValue: 'OPEN', newValue: 'ASSIGNED' }],
        userEmail,
      );
    });

    it('should not create audit entries when no fields changed', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const userEmail = 'admin@gov.bc.ca';
      const existing = createTestReferral({
        id: referralId,
        referralStatus: PrismaReferralStatus.OPEN,
      });
      const dto = { referralStatus: ReferralStatus.OPEN };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(existing);

      // Act
      await service.update(referralId, dto, userId, userEmail);

      // Assert
      expect(mockAuditService.createAuditEntries).not.toHaveBeenCalled();
    });

    it('should resolve FK fields to human-readable names in audit entries', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const userEmail = 'admin@gov.bc.ca';
      const oldMinistryId = crypto.randomUUID();
      const newMinistryId = crypto.randomUUID();
      const existing = createTestReferral({
        id: referralId,
        ministryId: oldMinistryId,
      });
      // Simulate the included relation from findOne
      (existing as Record<string, unknown>).ministry = {
        id: oldMinistryId,
        name: 'Old Ministry',
      };
      const updated = createTestReferral({
        id: referralId,
        ministryId: newMinistryId,
      });
      const dto = { ministryId: newMinistryId };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(updated);
      mockPrismaService.ministry.findUnique.mockResolvedValue({
        name: 'New Ministry',
      });

      // Act
      await service.update(referralId, dto, userId, userEmail);

      // Assert
      expect(mockAuditService.createAuditEntries).toHaveBeenCalledWith(
        referralId,
        AuditAction.UPDATE,
        [
          {
            field: 'ministry',
            oldValue: 'Old Ministry',
            newValue: 'New Ministry',
          },
        ],
        userEmail,
      );
      expect(mockPrismaService.ministry.findUnique).toHaveBeenCalledWith({
        where: { id: newMinistryId },
        select: { name: true },
      });
    });

    it('should throw NotFoundException when updating a non-existent referral', async () => {
      // Arrange
      const id = crypto.randomUUID();
      mockPrismaService.referral.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(id, { referralStatus: ReferralStatus.CLOSED }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should still return updated referral when audit logging fails', async () => {
      // Arrange
      const referralId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const userEmail = 'admin@gov.bc.ca';
      const existing = createTestReferral({
        id: referralId,
        referralStatus: PrismaReferralStatus.OPEN,
      });
      const updated = createTestReferral({
        id: referralId,
        referralStatus: PrismaReferralStatus.ASSIGNED,
      });
      const dto = { referralStatus: ReferralStatus.ASSIGNED };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(updated);
      mockAuditService.createAuditEntries.mockRejectedValue(
        new Error('DB write failed'),
      );

      // Act
      const result = await service.update(referralId, dto, userId, userEmail);

      // Assert - update succeeds despite audit failure
      expect(result).toEqual(updated);
    });
  });
});
