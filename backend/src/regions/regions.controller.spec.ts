import { Test, TestingModule } from '@nestjs/testing';
import { RegionsController } from './regions.controller';
import { RegionsService } from './regions.service';

const mockRegionsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockRegion = {
  id: 'region-1',
  name: 'Test Region',
};

describe('RegionsController', () => {
  let controller: RegionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegionsController],
      providers: [{ provide: RegionsService, useValue: mockRegionsService }],
    }).compile();

    controller = module.get<RegionsController>(RegionsController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should delegate to service', async () => {
      mockRegionsService.findAll.mockResolvedValue([mockRegion]);

      const result = await controller.findAll();

      expect(result).toEqual([mockRegion]);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id', async () => {
      mockRegionsService.findOne.mockResolvedValue(mockRegion);

      const result = await controller.findOne('region-1');

      expect(result).toEqual(mockRegion);
      expect(mockRegionsService.findOne).toHaveBeenCalledWith('region-1');
    });
  });

  describe('create', () => {
    it('should delegate to service with dto', async () => {
      mockRegionsService.create.mockResolvedValue(mockRegion);

      const result = await controller.create({ name: 'Test Region' } as any);

      expect(result).toEqual(mockRegion);
      expect(mockRegionsService.create).toHaveBeenCalledWith({
        name: 'Test Region',
      });
    });
  });

  describe('update', () => {
    it('should delegate to service with id and dto', async () => {
      const updated = { ...mockRegion, name: 'Updated Region' };
      mockRegionsService.update.mockResolvedValue(updated);

      const result = await controller.update('region-1', {
        name: 'Updated Region',
      } as any);

      expect(result.name).toBe('Updated Region');
      expect(mockRegionsService.update).toHaveBeenCalledWith('region-1', {
        name: 'Updated Region',
      });
    });
  });

  describe('remove', () => {
    it('should delegate to service with id', async () => {
      mockRegionsService.remove.mockResolvedValue(mockRegion);

      await controller.remove('region-1');

      expect(mockRegionsService.remove).toHaveBeenCalledWith('region-1');
    });
  });
});
