import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockUser = {
  id: 'user-1',
  fullName: 'Test User',
  email: 'test@test.com',
  role: 'ADMIN',
  isActive: true,
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to service', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);
      const dto = { fullName: 'Test User', email: 'test@test.com' };

      const result = await controller.create(dto as any);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should parse isActive true string to boolean', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      await controller.findAll('ADMIN' as any, 'true');

      expect(mockUsersService.findAll).toHaveBeenCalledWith('ADMIN', true);
    });

    it('should parse isActive false string to boolean', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      await controller.findAll(undefined, 'false');

      expect(mockUsersService.findAll).toHaveBeenCalledWith(undefined, false);
    });

    it('should pass undefined when isActive not provided', async () => {
      mockUsersService.findAll.mockResolvedValue([mockUser]);

      await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });

  describe('findOne', () => {
    it('should delegate to service with id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-1');

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
    });
  });

  describe('update', () => {
    it('should delegate to service with id and dto', async () => {
      const dto = { fullName: 'Updated User' };
      mockUsersService.update.mockResolvedValue({
        ...mockUser,
        fullName: 'Updated User',
      });

      const result = await controller.update('user-1', dto as any);

      expect(result.fullName).toBe('Updated User');
      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to service with id', async () => {
      mockUsersService.remove.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await controller.remove('user-1');

      expect(result.isActive).toBe(false);
      expect(mockUsersService.remove).toHaveBeenCalledWith('user-1');
    });
  });
});
