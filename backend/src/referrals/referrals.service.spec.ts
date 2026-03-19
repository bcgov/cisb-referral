import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReferredByType,
  YesNoUnknown,
  ReleaseFromType,
  CreateReferralDto,
} from './dto/create-referral.dto';
import { ReferralStatus, UpdateReferralDto } from './dto/update-referral.dto';

describe('ReferralsService', () => {
  let service: ReferralsService;
  const fixedNow = new Date(2026, 2, 19, 9, 0, 0, 0);

  const createReferralDto = (
    overrides: Partial<CreateReferralDto> = {},
  ): CreateReferralDto => ({
    referredBy: ReferredByType.SDPR_INTERNAL,
    referrerContactName: 'Test Contact',
    referrerEmail: 'test@test.com',
    referrerPhone: '0000000000',
    individualFirstName: 'Test',
    regionId: 'region-uuid-1',
    specificCityTown: 'Test City',
    currentlyHomeless: YesNoUnknown.NO,
    ...overrides,
  });

  const createMockReferral = (overrides = {}) => ({
    id: 'referral-uuid-1',
    referredBy: ReferredByType.SDPR_INTERNAL,
    referrerContactName: 'Test Contact',
    referrerEmail: 'test@test.com',
    referrerPhone: '0000000000',
    individualFirstName: 'Test',
    regionId: 'region-uuid-1',
    specificCityTown: 'Test City',
    currentlyHomeless: YesNoUnknown.NO,
    referralStatus: ReferralStatus.OPEN,
    flag: false,
    createdBy: 'contact-uuid-1',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
    region: { id: 'region-uuid-1', name: 'Test Region' },
    ministry: null,
    agencyType: null,
    assignedTo: null,
    ...overrides,
  });

  const toLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getReleaseDateFromFixedNow = (daysFromNow: number): string => {
    const date = new Date(fixedNow);
    date.setDate(date.getDate() + daysFromNow);
    return toLocalDateString(date);
  };

  const expectCreatedReferralFlag = async (
    dto: CreateReferralDto,
    expectedFlag: boolean,
  ): Promise<void> => {
    mockPrismaService.referral.create.mockResolvedValue(
      createMockReferral({ flag: expectedFlag }),
    );

    await service.create(dto, 'contact-uuid-1');

    expect(mockPrismaService.referral.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ flag: expectedFlag }),
      }),
    );
  };

  const mockPrismaService = {
    referral: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    referralStatusHistory: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferralsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReferralsService>(ReferralsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('urgent referral flag calculation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(fixedNow);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should flag as urgent when currentlyHomeless is YES', async () => {
      const dto = createReferralDto({
        currentlyHomeless: YesNoUnknown.YES,
      });

      await expectCreatedReferralFlag(dto, true);
    });

    it('should not flag as urgent when currentlyHomeless is NO', async () => {
      const dto = createReferralDto({
        currentlyHomeless: YesNoUnknown.NO,
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should not flag as urgent when currentlyHomeless is UNKNOWN', async () => {
      const dto = createReferralDto({
        currentlyHomeless: YesNoUnknown.UNKNOWN,
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should flag as urgent when losingHousing is YES', async () => {
      const dto = createReferralDto({ losingHousing: YesNoUnknown.YES });

      await expectCreatedReferralFlag(dto, true);
    });

    it('should not flag as urgent when losingHousing is NO', async () => {
      const dto = createReferralDto({ losingHousing: YesNoUnknown.NO });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should not flag as urgent when losingHousing is UNKNOWN', async () => {
      const dto = createReferralDto({ losingHousing: YesNoUnknown.UNKNOWN });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should flag as urgent when pendingRelease is not NO and releaseDate is within 4 days', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: getReleaseDateFromFixedNow(3),
      });

      await expectCreatedReferralFlag(dto, true);
    });

    it('should flag as urgent for each release type except NO when releaseDate is within 4 days', async () => {
      const releaseDateStr = getReleaseDateFromFixedNow(1);

      const urgentReleaseTypes = [
        ReleaseFromType.HOSPITAL_MEDICAL_FACILITY,
        ReleaseFromType.CORRECTIONS,
        ReleaseFromType.YOUTH_TRANSITION_MCFD,
        ReleaseFromType.YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY,
        ReleaseFromType.ALCOHOL_DRUG_FACILITY,
      ];

      for (const releaseType of urgentReleaseTypes) {
        jest.clearAllMocks();
        const dto = createReferralDto({
          pendingRelease: releaseType,
          releaseDate: releaseDateStr,
        });

        await expectCreatedReferralFlag(dto, true);
      }
    });

    it('should not flag as urgent when pendingRelease is not NO but releaseDate is more than 4 days away', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: getReleaseDateFromFixedNow(10),
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should not flag as urgent when pendingRelease is not NO but releaseDate is in the past', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: getReleaseDateFromFixedNow(-5),
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should not flag as urgent when pendingRelease is not NO but releaseDate is missing', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: undefined,
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should not flag as urgent when pendingRelease is NO even with releaseDate within 4 days', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.NO,
        releaseDate: getReleaseDateFromFixedNow(1),
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should not flag as urgent when no urgency conditions are met', async () => {
      const dto = createReferralDto({
        currentlyHomeless: YesNoUnknown.NO,
        losingHousing: YesNoUnknown.NO,
        pendingRelease: undefined,
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should flag as urgent when multiple urgency conditions are met', async () => {
      const dto = createReferralDto({
        currentlyHomeless: YesNoUnknown.YES,
        losingHousing: YesNoUnknown.YES,
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: getReleaseDateFromFixedNow(1),
      });

      await expectCreatedReferralFlag(dto, true);
    });

    it('should flag as urgent on releaseDate boundary of exactly 4 days', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.HOSPITAL_MEDICAL_FACILITY,
        releaseDate: getReleaseDateFromFixedNow(4),
      });

      await expectCreatedReferralFlag(dto, true);
    });

    it('should not flag as urgent when releaseDate is exactly 5 days away', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.HOSPITAL_MEDICAL_FACILITY,
        releaseDate: getReleaseDateFromFixedNow(5),
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should flag as urgent when releaseDate is today and pendingRelease is not NO', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: getReleaseDateFromFixedNow(0),
      });

      await expectCreatedReferralFlag(dto, true);
    });

    it('should not flag as urgent when pendingRelease is not NO but releaseDate is yesterday', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: getReleaseDateFromFixedNow(-1),
      });

      await expectCreatedReferralFlag(dto, false);
    });

    it('should not flag as urgent when releaseDate is invalid', async () => {
      const dto = createReferralDto({
        pendingRelease: ReleaseFromType.CORRECTIONS,
        releaseDate: 'not-a-date',
      });

      await expectCreatedReferralFlag(dto, false);
    });
  });

  describe('create', () => {
    it('should create a referral with OPEN status and calculated flag', async () => {
      const dto = createReferralDto();
      const contactId = 'contact-uuid-1';
      const expected = createMockReferral();
      mockPrismaService.referral.create.mockResolvedValue(expected);

      const result = await service.create(dto, contactId);

      expect(result).toEqual(expected);
      expect(mockPrismaService.referral.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            referralStatus: ReferralStatus.OPEN,
            createdBy: contactId,
            flag: false,
          }),
        }),
      );
    });

    it('should convert date strings to Date objects', async () => {
      const dto = createReferralDto({
        individualDateOfBirth: '1990-05-15',
        releaseDate: '2026-06-01',
      });
      mockPrismaService.referral.create.mockResolvedValue(createMockReferral());

      await service.create(dto, 'contact-uuid-1');

      expect(mockPrismaService.referral.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            individualDateOfBirth: new Date('1990-05-15'),
            releaseDate: new Date('2026-06-01'),
          }),
        }),
      );
    });

    it('should include related entities in response', async () => {
      const dto = createReferralDto();
      mockPrismaService.referral.create.mockResolvedValue(createMockReferral());

      await service.create(dto, 'contact-uuid-1');

      expect(mockPrismaService.referral.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { region: true, ministry: true, agencyType: true },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results with metadata', async () => {
      const mockData = [createMockReferral()];
      mockPrismaService.referral.findMany.mockResolvedValue(mockData);
      mockPrismaService.referral.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: mockData,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      });
    });

    it('should use default pagination when not specified', async () => {
      mockPrismaService.referral.findMany.mockResolvedValue([]);
      mockPrismaService.referral.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockPrismaService.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should calculate correct skip for pagination', async () => {
      mockPrismaService.referral.findMany.mockResolvedValue([]);
      mockPrismaService.referral.count.mockResolvedValue(25);

      const result = await service.findAll({ page: 3, limit: 5 });

      expect(mockPrismaService.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
      expect(result.meta.totalPages).toBe(5);
    });

    it('should filter by status when provided', async () => {
      mockPrismaService.referral.findMany.mockResolvedValue([]);
      mockPrismaService.referral.count.mockResolvedValue(0);

      await service.findAll({ status: ReferralStatus.ASSIGNED });

      expect(mockPrismaService.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { referralStatus: ReferralStatus.ASSIGNED },
        }),
      );
    });

    it('should filter by regionId when provided', async () => {
      mockPrismaService.referral.findMany.mockResolvedValue([]);
      mockPrismaService.referral.count.mockResolvedValue(0);

      await service.findAll({ regionId: 'region-uuid-1' });

      expect(mockPrismaService.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { regionId: 'region-uuid-1' },
        }),
      );
    });

    it('should filter by assignedToId when provided', async () => {
      mockPrismaService.referral.findMany.mockResolvedValue([]);
      mockPrismaService.referral.count.mockResolvedValue(0);

      await service.findAll({ assignedToId: 'user-uuid-1' });

      expect(mockPrismaService.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assignedToId: 'user-uuid-1' },
        }),
      );
    });

    it('should combine multiple filters', async () => {
      mockPrismaService.referral.findMany.mockResolvedValue([]);
      mockPrismaService.referral.count.mockResolvedValue(0);

      await service.findAll({
        status: ReferralStatus.OPEN,
        regionId: 'region-uuid-1',
        assignedToId: 'user-uuid-1',
      });

      expect(mockPrismaService.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            referralStatus: ReferralStatus.OPEN,
            regionId: 'region-uuid-1',
            assignedToId: 'user-uuid-1',
          },
        }),
      );
    });

    it('should order results by createdAt descending', async () => {
      mockPrismaService.referral.findMany.mockResolvedValue([]);
      mockPrismaService.referral.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockPrismaService.referral.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a referral with related entities', async () => {
      const expected = createMockReferral({ statusHistory: [] });
      mockPrismaService.referral.findUnique.mockResolvedValue(expected);

      const result = await service.findOne('referral-uuid-1');

      expect(result).toEqual(expected);
      expect(mockPrismaService.referral.findUnique).toHaveBeenCalledWith({
        where: { id: 'referral-uuid-1' },
        include: expect.objectContaining({
          region: true,
          ministry: true,
          agencyType: true,
          assignedTo: true,
          statusHistory: expect.objectContaining({
            orderBy: { createdAt: 'desc' },
          }),
        }),
      });
    });

    it('should throw NotFoundException when referral does not exist', async () => {
      mockPrismaService.referral.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        'Referral with ID nonexistent-id not found',
      );
    });
  });

  describe('update', () => {
    it('should update a referral and return result with relations', async () => {
      const existing = createMockReferral();
      const updateDto: UpdateReferralDto = { assignedToId: 'user-uuid-2' };
      const updated = createMockReferral({
        assignedToId: 'user-uuid-2',
        assignedTo: { id: 'user-uuid-2', fullName: 'Test User' },
      });

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(updated);

      const result = await service.update(
        'referral-uuid-1',
        updateDto,
        'admin-uuid-1',
      );

      expect(result).toEqual(updated);
      expect(mockPrismaService.referral.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'referral-uuid-1' },
          data: expect.objectContaining({
            assignedToId: 'user-uuid-2',
            modifiedBy: 'admin-uuid-1',
          }),
        }),
      );
    });

    it('should create status history when status changes', async () => {
      const existing = createMockReferral({
        referralStatus: ReferralStatus.OPEN,
      });
      const updateDto: UpdateReferralDto = {
        referralStatus: ReferralStatus.ASSIGNED,
      };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(
        createMockReferral({ referralStatus: ReferralStatus.ASSIGNED }),
      );

      await service.update('referral-uuid-1', updateDto, 'admin-uuid-1');

      expect(
        mockPrismaService.referralStatusHistory.create,
      ).toHaveBeenCalledWith({
        data: {
          referralId: 'referral-uuid-1',
          fromStatus: ReferralStatus.OPEN,
          toStatus: ReferralStatus.ASSIGNED,
          createdBy: 'admin-uuid-1',
        },
      });
    });

    it('should not create status history when status is unchanged', async () => {
      const existing = createMockReferral({
        referralStatus: ReferralStatus.OPEN,
      });
      const updateDto: UpdateReferralDto = {
        referralStatus: ReferralStatus.OPEN,
      };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(existing);

      await service.update('referral-uuid-1', updateDto);

      expect(
        mockPrismaService.referralStatusHistory.create,
      ).not.toHaveBeenCalled();
    });

    it('should not create status history when status is not provided', async () => {
      const existing = createMockReferral();
      const updateDto: UpdateReferralDto = { assignedToId: 'user-uuid-2' };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(existing);

      await service.update('referral-uuid-1', updateDto);

      expect(
        mockPrismaService.referralStatusHistory.create,
      ).not.toHaveBeenCalled();
    });

    it('should convert date strings to Date objects on update', async () => {
      const existing = createMockReferral();
      const updateDto: UpdateReferralDto = {
        followUpDate: '2026-07-01',
        dueDate: '2026-08-01',
        completedDate: '2026-09-01',
      };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referral.update.mockResolvedValue(existing);

      await service.update('referral-uuid-1', updateDto);

      expect(mockPrismaService.referral.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            followUpDate: new Date('2026-07-01'),
            dueDate: new Date('2026-08-01'),
            completedDate: new Date('2026-09-01'),
          }),
        }),
      );
    });

    it('should throw NotFoundException when updating a nonexistent referral', async () => {
      mockPrismaService.referral.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent-id', { assignedToId: 'user-uuid-2' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addStatusHistory', () => {
    it('should create a status history entry for an existing referral', async () => {
      const existing = createMockReferral({
        referralStatus: ReferralStatus.ASSIGNED,
      });
      const historyDto = {
        toStatus: ReferralStatus.CONTACT_MADE,
        comment: 'Initial contact via phone',
      };
      const expectedHistory = {
        id: 'history-uuid-1',
        referralId: 'referral-uuid-1',
        fromStatus: ReferralStatus.ASSIGNED,
        toStatus: ReferralStatus.CONTACT_MADE,
        comment: 'Initial contact via phone',
        createdBy: 'admin-uuid-1',
        createdAt: new Date(),
      };

      mockPrismaService.referral.findUnique.mockResolvedValue(existing);
      mockPrismaService.referralStatusHistory.create.mockResolvedValue(
        expectedHistory,
      );

      const result = await service.addStatusHistory(
        'referral-uuid-1',
        historyDto,
        'admin-uuid-1',
      );

      expect(result).toEqual(expectedHistory);
      expect(
        mockPrismaService.referralStatusHistory.create,
      ).toHaveBeenCalledWith({
        data: {
          referralId: 'referral-uuid-1',
          fromStatus: ReferralStatus.ASSIGNED,
          toStatus: ReferralStatus.CONTACT_MADE,
          comment: 'Initial contact via phone',
          createdBy: 'admin-uuid-1',
        },
      });
    });

    it('should throw NotFoundException when referral does not exist', async () => {
      mockPrismaService.referral.findUnique.mockResolvedValue(null);

      await expect(
        service.addStatusHistory(
          'nonexistent-id',
          { toStatus: ReferralStatus.CLOSED },
          'admin-uuid-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
