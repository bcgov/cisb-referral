import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { RegionDto } from './dto/region.dto';
import { Region } from '@prisma/client';

@ApiTags('regions')
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
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Region | null> {
    return this.regionsService.findOne(id);
  }
}
