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
import type { ReferralExportResult } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import {
  FindAllReferralsDto,
  REFERRAL_COLUMN_KEYS,
  SORTABLE_REFERRAL_COLUMN_KEYS,
  ReferralFilterOperator,
  ReferralSortOrder,
} from './dto/find-all-referrals.dto';
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter by keyword (contains) across referral columns',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: SORTABLE_REFERRAL_COLUMN_KEYS,
    description: 'Sort by referral column key',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ReferralSortOrder,
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'filterBy',
    required: false,
    enum: REFERRAL_COLUMN_KEYS,
    description: 'Column key to filter by',
  })
  @ApiQuery({
    name: 'filterOperator',
    required: false,
    enum: ReferralFilterOperator,
    description: 'Filter operator for selected column',
  })
  @ApiQuery({
    name: 'filterValue',
    required: false,
    type: String,
    description: 'Filter value (free text)',
  })
  @ApiResponse({ status: 200, description: 'List of referrals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() query: FindAllReferralsDto) {
    return this.referralsService.findAll(query);
  }

  @Get('export')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all referrals (capped) for client-side CSV export',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Filter by keyword across referral columns',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: SORTABLE_REFERRAL_COLUMN_KEYS,
    description: 'Sort by referral column key',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ReferralSortOrder,
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'filterBy',
    required: false,
    enum: REFERRAL_COLUMN_KEYS,
    description: 'Column key to filter by',
  })
  @ApiQuery({
    name: 'filterOperator',
    required: false,
    enum: ReferralFilterOperator,
    description: 'Filter operator for selected column',
  })
  @ApiQuery({
    name: 'filterValue',
    required: false,
    type: String,
    description: 'Filter value (free text)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Capped list of referrals with export metadata (total, exported, truncated, maxRows)',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportAll(
    @CurrentUser() user: User,
    @Query() query: FindAllReferralsDto,
  ): Promise<ReferralExportResult> {
    return this.referralsService.findAllForExport(user.id, query);
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
