import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

const mockContactsService = {
  updateProfile: jest.fn(),
};

const mockAuth = {
  contact: {
    id: 'contact-1',
    fullName: 'Test Contact',
    email: 'test@test.com',
    phone: '0000000000',
    userName: 'testuser',
  },
  isProfileComplete: true,
};

describe('ContactsController', () => {
  let controller: ContactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [{ provide: ContactsService, useValue: mockContactsService }],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return contact profile from auth context', async () => {
      const result = await controller.getProfile(mockAuth as any);

      expect(result.contact.id).toBe('contact-1');
      expect(result.contact.fullName).toBe('Test Contact');
      expect(result.contact.email).toBe('test@test.com');
      expect(result.contact.phone).toBe('0000000000');
      expect(result.contact.userName).toBe('testuser');
      expect(result.isProfileComplete).toBe(true);
    });

    it('should return isProfileComplete false from auth context', async () => {
      const incompleteAuth = { ...mockAuth, isProfileComplete: false };

      const result = await controller.getProfile(incompleteAuth as any);

      expect(result.isProfileComplete).toBe(false);
    });
  });

  describe('updateProfile', () => {
    it('should delegate to service and return shaped response', async () => {
      const updatedContact = {
        ...mockAuth.contact,
        phone: '1111111111',
      };
      mockContactsService.updateProfile.mockResolvedValue({
        contact: updatedContact,
        isProfileComplete: true,
      });

      const result = await controller.updateProfile(mockAuth as any, {
        phone: '1111111111',
      });

      expect(result.contact.phone).toBe('1111111111');
      expect(result.isProfileComplete).toBe(true);
      expect(mockContactsService.updateProfile).toHaveBeenCalledWith(
        'contact-1',
        { phone: '1111111111' },
      );
    });
  });
});
