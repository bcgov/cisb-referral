import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto';
import { Contact } from '../generated/prisma/client';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a contact has completed their profile setup
   * Required fields: fullName, email, phone
   */
  isProfileComplete(contact: {
    fullName: string;
    email: string;
    phone: string | null;
  }): boolean {
    return Boolean(contact.fullName && contact.email && contact.phone);
  }

  /**
   * Find a contact by ID
   */
  async findById(id: string): Promise<Contact | null> {
    return this.prisma.contact.findUnique({
      where: { id },
    });
  }

  /**
   * Update a contact's profile
   * Returns updated contact with isProfileComplete status
   */
  async updateProfile(
    contactId: string,
    dto: UpdateProfileDto,
  ): Promise<{ contact: Contact; isProfileComplete: boolean }> {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found.');
    }

    const updatedContact = await this.prisma.contact.update({
      where: { id: contactId },
      data: {
        phone: dto.phone,
      },
    });

    return {
      contact: updatedContact,
      isProfileComplete: this.isProfileComplete(updatedContact),
    };
  }
}
