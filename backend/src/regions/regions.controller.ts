import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
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
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { RegionDto } from './dto/region.dto';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region, UserRole } from '@prisma/client';
import { AdminAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

@ApiTags('regions')
@ApiBearerAuth()
@Controller({ path: 'regions', version: '1' })
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({
    status: 200,
    description: 'List of all regions',
    type: [RegionDto],
  })
  async findAll(): Promise<Region[]> {
    return this.regionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get region by ID' })
  @ApiResponse({ status: 200, description: 'Region details', type: RegionDto })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Region> {
    return this.regionsService.findOne(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Create a new region' })
  @ApiBody({ type: CreateRegionDto })
  @ApiResponse({
    status: 201,
    description: 'Region created successfully',
    type: RegionDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({
    status: 409,
    description: 'Region with this name already exists',
  })
  async create(@Body() createRegionDto: CreateRegionDto): Promise<Region> {
    return this.regionsService.create(createRegionDto);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Update a region' })
  @ApiBody({ type: UpdateRegionDto })
  @ApiResponse({
    status: 200,
    description: 'Region updated successfully',
    type: RegionDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Region not found' })
  @ApiResponse({
    status: 409,
    description: 'Region with this name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRegionDto: UpdateRegionDto,
  ): Promise<Region> {
    return this.regionsService.update(id, updateRegionDto);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SYSTEM_ADMINISTRATOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a region' })
  @ApiResponse({ status: 204, description: 'Region deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Region not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.regionsService.remove(id);
  }
}
