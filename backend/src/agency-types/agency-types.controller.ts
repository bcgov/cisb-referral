import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AgencyTypesService } from './agency-types.service';
import { AgencyTypeDto } from './dto/agency-type.dto';
import { CreateAgencyTypeDto } from './dto/create-agency-type.dto';
import { UpdateAgencyTypeDto } from './dto/update-agency-type.dto';
import { AgencyType, UserRole } from '@prisma/client';
import { AdminAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

@ApiTags('agency-types')
@ApiBearerAuth()
@Controller({ path: 'agency-types', version: '1' })
export class AgencyTypesController {
  constructor(private readonly agencyTypesService: AgencyTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all agency types' })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of agency types',
    type: [AgencyTypeDto],
  })
  async findAll(@Query('active') active?: string): Promise<AgencyType[]> {
    const activeOnly = active === 'true';
    return this.agencyTypesService.findAll(activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agency type by ID' })
  @ApiResponse({
    status: 200,
    description: 'Agency type details',
    type: AgencyTypeDto,
  })
  @ApiResponse({ status: 404, description: 'Agency type not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<AgencyType> {
    return this.agencyTypesService.findOne(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Create a new agency type' })
  @ApiBody({ type: CreateAgencyTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Agency type created successfully',
    type: AgencyTypeDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Agency type with this name already exists',
  })
  async create(
    @Body() createAgencyTypeDto: CreateAgencyTypeDto,
  ): Promise<AgencyType> {
    return this.agencyTypesService.create(createAgencyTypeDto);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Update an agency type' })
  @ApiBody({ type: UpdateAgencyTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Agency type updated successfully',
    type: AgencyTypeDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Agency type not found' })
  @ApiResponse({
    status: 409,
    description: 'Agency type with this name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAgencyTypeDto: UpdateAgencyTypeDto,
  ): Promise<AgencyType> {
    return this.agencyTypesService.update(id, updateAgencyTypeDto);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agency type' })
  @ApiResponse({ status: 204, description: 'Agency type deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Agency type not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.agencyTypesService.remove(id);
  }
}
