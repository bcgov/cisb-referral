import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto, ReferralStatus } from './dto/update-referral.dto';
import { CreateStatusHistoryDto } from './dto/create-status-history.dto';
import { Referral, ReferralStatusHistory } from '@prisma/client';

@ApiTags('referrals')
@Controller({ path: 'referrals', version: '1' })
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new referral' })
  @ApiResponse({ status: 201, description: 'Referral created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(
    @Body() createReferralDto: CreateReferralDto,
  ): Promise<Referral> {
    return this.referralsService.create(createReferralDto);
  }

  @Get()
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
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ReferralStatus,
    @Query('regionId') regionId?: string,
    @Query('assignedToId') assignedToId?: string,
  ) {
    return this.referralsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      regionId,
      assignedToId,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get referral by ID' })
  @ApiResponse({ status: 200, description: 'Referral details' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Referral> {
    return this.referralsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update referral' })
  @ApiResponse({ status: 200, description: 'Referral updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReferralDto: UpdateReferralDto,
  ): Promise<Referral> {
    return this.referralsService.update(id, updateReferralDto);
  }

  @Post(':id/status-history')
  @ApiOperation({ summary: 'Add status history entry' })
  @ApiResponse({ status: 201, description: 'Status history entry created' })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async addStatusHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() createStatusHistoryDto: CreateStatusHistoryDto,
  ): Promise<ReferralStatusHistory> {
    return this.referralsService.addStatusHistory(id, createStatusHistoryDto);
  }
}
