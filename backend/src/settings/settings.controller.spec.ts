import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

const mockSettingsService = {
  getAdminColumns: jest.fn(),
  setAdminColumns: jest.fn(),
};

describe('SettingsController', () => {
  let controller: SettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    jest.clearAllMocks();
  });

  describe('getAdminColumns', () => {
    it('should return columns from service', async () => {
      const columns = ['flag', 'createdAt'];
      mockSettingsService.getAdminColumns.mockResolvedValue(columns);

      const result = await controller.getAdminColumns();

      expect(result).toEqual({ columns });
      expect(mockSettingsService.getAdminColumns).toHaveBeenCalledTimes(1);
    });
  });

  describe('setAdminColumns', () => {
    it('should delegate to service with dto columns and current user id', async () => {
      const user = { id: 'user-1' };
      const dto = { columns: ['flag', 'assignedTo'] };
      mockSettingsService.setAdminColumns.mockResolvedValue(dto.columns);

      const result = await controller.setAdminColumns(dto, user as any);

      expect(result).toEqual({ columns: dto.columns });
      expect(mockSettingsService.setAdminColumns).toHaveBeenCalledWith(
        dto.columns,
        'user-1',
      );
    });
  });
});
