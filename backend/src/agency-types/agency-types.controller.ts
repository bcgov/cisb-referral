import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AgencyTypesService } from './agency-types.service';
import { AgencyTypeDto } from './dto/agency-type.dto';
import { AgencyType } from '@prisma/client';

@ApiTags('agency-types')
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
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AgencyType | null> {
    return this.agencyTypesService.findOne(id);
  }
}
