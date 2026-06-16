import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  appSetting: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

const DEFAULT_ADMIN_COLUMNS = [
  'flag',
  'createdAt',
  'referrerContactName',
  'referredBy',
  'referralStatus',
  'referralOutcome',
  'individualFirstName',
  'individualLastName',
  'region',
  'specificCityTown',
  'assignedTo',
];

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    jest.clearAllMocks();
  });

  describe('getAdminColumns', () => {
    it('should return defaults when setting does not exist', async () => {
      mockPrismaService.appSetting.findUnique.mockResolvedValue(null);

      const result = await service.getAdminColumns();

      expect(result).toEqual(DEFAULT_ADMIN_COLUMNS);
      expect(mockPrismaService.appSetting.findUnique).toHaveBeenCalledWith({
        where: { key: 'referrals.adminColumns' },
      });
    });

    it('should return persisted columns when value is a string array', async () => {
      const storedColumns = ['flag', 'assignedTo'];
      mockPrismaService.appSetting.findUnique.mockResolvedValue({
        key: 'referrals.adminColumns',
        value: storedColumns,
      });

      const result = await service.getAdminColumns();

      expect(result).toEqual(storedColumns);
    });

    it('should return defaults when persisted value is not an array', async () => {
      mockPrismaService.appSetting.findUnique.mockResolvedValue({
        key: 'referrals.adminColumns',
        value: 'not-an-array',
      });

      const result = await service.getAdminColumns();

      expect(result).toEqual(DEFAULT_ADMIN_COLUMNS);
    });

    it('should return defaults when array contains non-string values', async () => {
      mockPrismaService.appSetting.findUnique.mockResolvedValue({
        key: 'referrals.adminColumns',
        value: ['flag', 1000],
      });

      const result = await service.getAdminColumns();

      expect(result).toEqual(DEFAULT_ADMIN_COLUMNS);
    });
  });

  describe('setAdminColumns', () => {
    it('should upsert columns and include updatedBy when user id exists', async () => {
      const columns = ['flag', 'createdAt'];
      mockPrismaService.appSetting.upsert.mockResolvedValue({
        key: 'referrals.adminColumns',
        value: columns,
      });

      const result = await service.setAdminColumns(columns, 'user-1');

      expect(result).toEqual(columns);
      expect(mockPrismaService.appSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'referrals.adminColumns' },
        create: {
          key: 'referrals.adminColumns',
          value: columns,
          updatedBy: 'user-1',
        },
        update: {
          value: columns,
          updatedBy: 'user-1',
        },
      });
    });

    it('should upsert columns with updatedBy undefined when user id is missing', async () => {
      const columns = ['flag', 'createdAt'];
      mockPrismaService.appSetting.upsert.mockResolvedValue({
        key: 'referrals.adminColumns',
        value: columns,
      });

      await service.setAdminColumns(columns);

      expect(mockPrismaService.appSetting.upsert).toHaveBeenCalledWith({
        where: { key: 'referrals.adminColumns' },
        create: {
          key: 'referrals.adminColumns',
          value: columns,
          updatedBy: undefined,
        },
        update: {
          value: columns,
          updatedBy: undefined,
        },
      });
    });
  });
});
