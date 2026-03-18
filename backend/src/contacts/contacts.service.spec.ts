import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  contact: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockContact = {
  id: 'contact-1',
  fullName: 'Test Contact',
  email: 'test@test.com',
  phone: '0000000000',
  userName: 'testuser',
};

describe('ContactsService', () => {
  let service: ContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    jest.clearAllMocks();
  });

  describe('isProfileComplete', () => {
    it('should return true when all required fields are present', () => {
      const result = service.isProfileComplete({
        fullName: 'Test Contact',
        email: 'test@test.com',
        phone: '0000000000',
      });

      expect(result).toBe(true);
    });

    it('should return false when phone is null', () => {
      const result = service.isProfileComplete({
        fullName: 'Test Contact',
        email: 'test@test.com',
        phone: null,
      });

      expect(result).toBe(false);
    });

    it('should return false when fullName is empty', () => {
      const result = service.isProfileComplete({
        fullName: '',
        email: 'test@test.com',
        phone: '0000000000',
      });

      expect(result).toBe(false);
    });

    it('should return false when email is empty', () => {
      const result = service.isProfileComplete({
        fullName: 'Test Contact',
        email: '',
        phone: '0000000000',
      });

      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should return contact when found', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);

      const result = await service.findById('contact-1');

      expect(result).toEqual(mockContact);
      expect(mockPrismaService.contact.findUnique).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
      });
    });

    it('should return null when not found', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update phone and return profile status', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);
      mockPrismaService.contact.update.mockResolvedValue({
        ...mockContact,
        phone: '1111111111',
      });

      const result = await service.updateProfile('contact-1', {
        phone: '1111111111',
      });

      expect(result.contact.phone).toBe('1111111111');
      expect(result.isProfileComplete).toBe(true);
      expect(mockPrismaService.contact.update).toHaveBeenCalledWith({
        where: { id: 'contact-1' },
        data: { phone: '1111111111' },
      });
    });

    it('should throw NotFoundException when contact not found', async () => {
      mockPrismaService.contact.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProfile('nonexistent', { phone: '0000000000' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return isProfileComplete false when phone set to null', async () => {
      const contactNoPhone = { ...mockContact, phone: null };
      mockPrismaService.contact.findUnique.mockResolvedValue(mockContact);
      mockPrismaService.contact.update.mockResolvedValue(contactNoPhone);

      const result = await service.updateProfile('contact-1', {});

      expect(result.isProfileComplete).toBe(false);
    });
  });
});
