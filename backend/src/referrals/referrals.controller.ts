import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto, ReferralStatus } from './dto/update-referral.dto';
import type { Referral, User } from '../generated/prisma/client';
import {
  AdminAuthGuard,
  ContactAuthGuard,
  ProfileCompleteGuard,
} from '../auth/guards';
import { CurrentUser, CurrentContact } from '../auth/decorators';
import type { AuthenticatedContact } from '../auth/interfaces';

@ApiTags('referrals')
@Controller({ path: 'referrals', version: '1' })
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @UseGuards(ContactAuthGuard, ProfileCompleteGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new referral' })
  @ApiResponse({ status: 201, description: 'Referral created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Profile incomplete' })
  async create(
    @CurrentContact() auth: AuthenticatedContact,
    @Body() createReferralDto: CreateReferralDto,
  ): Promise<Referral> {
    return this.referralsService.create(createReferralDto, auth.contact.id);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all referrals with pagination and filtering' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReferralStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'regionId',
    required: false,
    type: String,
    description: 'Filter by region',
  })
  @ApiQuery({
    name: 'assignedToId',
    required: false,
    type: String,
    description: 'Filter by assigned user',
  })
  @ApiResponse({ status: 200, description: 'List of referrals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ReferralStatus,
    @Query('regionId') regionId?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.referralsService.findAll({
      page: page ? Number.parseInt(page, 10) : undefined,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
      status,
      regionId,
      assignedToId,
    });
  }

  @Get(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get referral by ID' })
  @ApiResponse({ status: 200, description: 'Referral details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Referral> {
    return this.referralsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update referral' })
  @ApiResponse({ status: 200, description: 'Referral updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReferralDto: UpdateReferralDto,
    @CurrentUser() user: User,
  ): Promise<Referral> {
    return this.referralsService.update(id, updateReferralDto, user.id);
  }
}
