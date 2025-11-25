import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MinistriesService } from './ministries.service';
import { MinistryDto } from './dto/ministry.dto';
import { Ministry } from '@prisma/client';

@ApiTags('ministries')
@Controller({ path: 'ministries', version: '1' })
export class MinistriesController {
  constructor(private readonly ministriesService: MinistriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all ministries' })
  @ApiQuery({
    name: 'active',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of ministries',
    type: [MinistryDto],
  })
  async findAll(@Query('active') active?: string): Promise<Ministry[]> {
    const activeOnly = active === 'true';
    return this.ministriesService.findAll(activeOnly);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ministry by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ministry details',
    type: MinistryDto,
  })
  @ApiResponse({ status: 404, description: 'Ministry not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Ministry | null> {
    return this.ministriesService.findOne(id);
  }
}
