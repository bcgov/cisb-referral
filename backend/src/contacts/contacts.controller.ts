import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { UpdateProfileDto } from './dto';
import { ContactAuthGuard } from '../auth/guards';
import { CurrentContact } from '../auth/decorators';
import type { AuthenticatedContact } from '../auth/interfaces';

@ApiTags('contacts')
@Controller({ path: 'contacts', version: '1' })
@UseGuards(ContactAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  /**
   * Get current authenticated contact's profile
   * Does NOT require profile to be complete (so they can see what's missing)
   */
  @Get('me')
  @ApiOperation({ summary: 'Get current contact profile' })
  @ApiResponse({ status: 200, description: 'Contact profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentContact() auth: AuthenticatedContact): Promise<{
    contact: {
      id: string;
      fullName: string;
      email: string;
      phone: string | null;
      userName: string;
    };
    isProfileComplete: boolean;
  }> {
    const { contact, isProfileComplete } = auth;

    return {
      contact: {
        id: contact.id,
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        userName: contact.userName,
      },
      isProfileComplete,
    };
  }

  /**
   * Update current authenticated contact's profile
   * Does NOT require profile to be complete (this is how they complete it)
   */
  @Patch('me')
  @ApiOperation({ summary: 'Update current contact profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentContact() auth: AuthenticatedContact,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<{
    contact: {
      id: string;
      fullName: string;
      email: string;
      phone: string | null;
      userName: string;
    };
    isProfileComplete: boolean;
  }> {
    const result = await this.contactsService.updateProfile(
      auth.contact.id,
      updateProfileDto,
    );

    return {
      contact: {
        id: result.contact.id,
        fullName: result.contact.fullName,
        email: result.contact.email,
        phone: result.contact.phone,
        userName: result.contact.userName,
      },
      isProfileComplete: result.isProfileComplete,
    };
  }
}
