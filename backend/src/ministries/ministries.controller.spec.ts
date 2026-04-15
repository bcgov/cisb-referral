import { Test, TestingModule } from '@nestjs/testing';
import { MinistriesController } from './ministries.controller';
import { MinistriesService } from './ministries.service';

const mockMinistriesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockMinistry = {
  id: 'ministry-1',
  name: 'Test Ministry',
  isActive: true,
};

const mockUser = { id: 'user-1' };

describe('MinistriesController', () => {
  let controller: MinistriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinistriesController],
      providers: [
        { provide: MinistriesService, useValue: mockMinistriesService },
      ],
    }).compile();

    controller = module.get<MinistriesController>(MinistriesController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should pass activeOnly true when active query is true', async () => {
      mockMinistriesService.findAll.mockResolvedValue([mockMinistry]);

      await controller.findAll('true');

      expect(mockMinistriesService.findAll).toHaveBeenCalledWith(true);
    });

    it('should pass activeOnly false when active query is not true', async () => {
      mockMinistriesService.findAll.mockResolvedValue([mockMinistry]);

      await controller.findAll();

      expect(mockMinistriesService.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id', async () => {
      mockMinistriesService.findOne.mockResolvedValue(mockMinistry);

      const result = await controller.findOne('ministry-1');

      expect(result).toEqual(mockMinistry);
      expect(mockMinistriesService.findOne).toHaveBeenCalledWith('ministry-1');
    });
  });

  describe('create', () => {
    it('should delegate to service with dto', async () => {
      mockMinistriesService.create.mockResolvedValue(mockMinistry);

      const result = await controller.create(
        {
          name: 'Test Ministry',
        } as any,
        mockUser as any,
      );

      expect(result).toEqual(mockMinistry);
      expect(mockMinistriesService.create).toHaveBeenCalledWith(
        {
          name: 'Test Ministry',
        },
        'user-1',
      );
    });
  });

  describe('update', () => {
    it('should delegate to service with id and dto', async () => {
      const updated = { ...mockMinistry, name: 'Updated Ministry' };
      mockMinistriesService.update.mockResolvedValue(updated);

      const result = await controller.update(
        'ministry-1',
        {
          name: 'Updated Ministry',
        } as any,
        mockUser as any,
      );

      expect(result.name).toBe('Updated Ministry');
      expect(mockMinistriesService.update).toHaveBeenCalledWith(
        'ministry-1',
        {
          name: 'Updated Ministry',
        },
        'user-1',
      );
    });
  });

  describe('remove', () => {
    it('should delegate to service with id', async () => {
      mockMinistriesService.remove.mockResolvedValue(mockMinistry);

      await controller.remove('ministry-1', mockUser as any);

      expect(mockMinistriesService.remove).toHaveBeenCalledWith(
        'ministry-1',
        'user-1',
      );
    });
  });
});
