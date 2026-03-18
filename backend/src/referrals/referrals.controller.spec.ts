import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralStatus } from './dto/update-referral.dto';

const mockReferralsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  addStatusHistory: jest.fn(),
};

const mockContact = {
  contact: { id: 'contact-1' },
  isProfileComplete: true,
};

const mockUser = { id: 'user-1' };

const mockReferral = {
  id: 'referral-1',
  individualFirstName: 'Test',
  individualLastName: 'Contact',
  referralStatus: ReferralStatus.OPEN,
  flag: false,
  createdAt: new Date(),
};

describe('ReferralsController', () => {
  let controller: ReferralsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferralsController],
      providers: [
        { provide: ReferralsService, useValue: mockReferralsService },
      ],
    }).compile();

    controller = module.get<ReferralsController>(ReferralsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to service with dto and contact id', async () => {
      const dto = { individualFirstName: 'Test' } as any;
      mockReferralsService.create.mockResolvedValue(mockReferral);

      const result = await controller.create(mockContact as any, dto);

      expect(result).toEqual(mockReferral);
      expect(mockReferralsService.create).toHaveBeenCalledWith(
        dto,
        'contact-1',
      );
    });
  });

  describe('findAll', () => {
    const mockPaginatedResult = {
      data: [mockReferral],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    it('should delegate to service with parsed params', async () => {
      mockReferralsService.findAll.mockResolvedValue(mockPaginatedResult);

      const result = await controller.findAll(
        '2',
        '20',
        ReferralStatus.OPEN,
        'region-1',
        'user-1',
      );

      expect(result).toEqual(mockPaginatedResult);
      expect(mockReferralsService.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        status: ReferralStatus.OPEN,
        regionId: 'region-1',
        assignedToId: 'user-1',
      });
    });

    it('should pass undefined for missing query params', async () => {
      mockReferralsService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll();

      expect(mockReferralsService.findAll).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
        status: undefined,
        regionId: undefined,
        assignedToId: undefined,
      });
    });

    it('should parse page and limit as integers', async () => {
      mockReferralsService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll('3', '50');

      expect(mockReferralsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3, limit: 50 }),
      );
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id', async () => {
      mockReferralsService.findOne.mockResolvedValue(mockReferral);

      const result = await controller.findOne('referral-1');

      expect(result).toEqual(mockReferral);
      expect(mockReferralsService.findOne).toHaveBeenCalledWith('referral-1');
    });
  });

  describe('update', () => {
    it('should delegate to service with id, dto, and user id', async () => {
      const dto = { referralStatus: ReferralStatus.ASSIGNED };
      const updatedReferral = {
        ...mockReferral,
        referralStatus: ReferralStatus.ASSIGNED,
      };
      mockReferralsService.update.mockResolvedValue(updatedReferral);

      const result = await controller.update(
        'referral-1',
        dto as any,
        mockUser as any,
      );

      expect(result).toEqual(updatedReferral);
      expect(mockReferralsService.update).toHaveBeenCalledWith(
        'referral-1',
        dto,
        'user-1',
      );
    });
  });

  describe('addStatusHistory', () => {
    const mockStatusEntry = {
      id: 'history-1',
      referralId: 'referral-1',
      fromStatus: ReferralStatus.OPEN,
      toStatus: ReferralStatus.ASSIGNED,
    };

    it('should delegate to service with id, dto, and user id', async () => {
      const dto = {
        toStatus: ReferralStatus.ASSIGNED,
        comment: 'Test comment',
      };
      mockReferralsService.addStatusHistory.mockResolvedValue(mockStatusEntry);

      const result = await controller.addStatusHistory(
        'referral-1',
        dto,
        mockUser as any,
      );

      expect(result).toEqual(mockStatusEntry);
      expect(mockReferralsService.addStatusHistory).toHaveBeenCalledWith(
        'referral-1',
        dto,
        'user-1',
      );
    });
  });
});
