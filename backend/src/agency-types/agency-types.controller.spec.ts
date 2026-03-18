import { Test, TestingModule } from '@nestjs/testing';
import { AgencyTypesController } from './agency-types.controller';
import { AgencyTypesService } from './agency-types.service';

const mockAgencyTypesService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockAgencyType = {
  id: 'agency-type-1',
  name: 'Test Agency Type',
  isActive: true,
};

describe('AgencyTypesController', () => {
  let controller: AgencyTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgencyTypesController],
      providers: [
        { provide: AgencyTypesService, useValue: mockAgencyTypesService },
      ],
    }).compile();

    controller = module.get<AgencyTypesController>(AgencyTypesController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should pass activeOnly true when active query is true', async () => {
      mockAgencyTypesService.findAll.mockResolvedValue([mockAgencyType]);

      await controller.findAll('true');

      expect(mockAgencyTypesService.findAll).toHaveBeenCalledWith(true);
    });

    it('should pass activeOnly false when active query is not true', async () => {
      mockAgencyTypesService.findAll.mockResolvedValue([mockAgencyType]);

      await controller.findAll();

      expect(mockAgencyTypesService.findAll).toHaveBeenCalledWith(false);
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id', async () => {
      mockAgencyTypesService.findOne.mockResolvedValue(mockAgencyType);

      const result = await controller.findOne('agency-type-1');

      expect(result).toEqual(mockAgencyType);
      expect(mockAgencyTypesService.findOne).toHaveBeenCalledWith(
        'agency-type-1',
      );
    });
  });

  describe('create', () => {
    it('should delegate to service with dto', async () => {
      mockAgencyTypesService.create.mockResolvedValue(mockAgencyType);

      const result = await controller.create({
        name: 'Test Agency Type',
      } as any);

      expect(result).toEqual(mockAgencyType);
      expect(mockAgencyTypesService.create).toHaveBeenCalledWith({
        name: 'Test Agency Type',
      });
    });
  });

  describe('update', () => {
    it('should delegate to service with id and dto', async () => {
      const updated = { ...mockAgencyType, name: 'Updated Agency Type' };
      mockAgencyTypesService.update.mockResolvedValue(updated);

      const result = await controller.update('agency-type-1', {
        name: 'Updated Agency Type',
      } as any);

      expect(result.name).toBe('Updated Agency Type');
      expect(mockAgencyTypesService.update).toHaveBeenCalledWith(
        'agency-type-1',
        { name: 'Updated Agency Type' },
      );
    });
  });

  describe('remove', () => {
    it('should delegate to service with id', async () => {
      mockAgencyTypesService.remove.mockResolvedValue(mockAgencyType);

      await controller.remove('agency-type-1');

      expect(mockAgencyTypesService.remove).toHaveBeenCalledWith(
        'agency-type-1',
      );
    });
  });
});
