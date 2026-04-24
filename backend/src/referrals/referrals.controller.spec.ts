import { Test, TestingModule } from '@nestjs/testing';
import { ReferralsController } from './referrals.controller';
import { ReferralsService } from './referrals.service';
import { ReferralStatus } from './dto/update-referral.dto';

const mockReferralsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
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

    it('should delegate to service with the validated query dto', async () => {
      mockReferralsService.findAll.mockResolvedValue(mockPaginatedResult);

      const query = {
        page: 2,
        limit: 20,
        status: ReferralStatus.OPEN,
        regionId: 'region-1',
        assignedToId: 'user-1',
      };
      const result = await controller.findAll(query);

      expect(result).toEqual(mockPaginatedResult);
      expect(mockReferralsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should pass an empty query through to the service', async () => {
      mockReferralsService.findAll.mockResolvedValue(mockPaginatedResult);

      await controller.findAll({});

      expect(mockReferralsService.findAll).toHaveBeenCalledWith({});
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
});
