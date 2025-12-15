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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { MinistriesService } from './ministries.service';
import { MinistryDto } from './dto/ministry.dto';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
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
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Ministry> {
    return this.ministriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ministry' })
  @ApiBody({ type: CreateMinistryDto })
  @ApiResponse({
    status: 201,
    description: 'Ministry created successfully',
    type: MinistryDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 409,
    description: 'Ministry with this name already exists',
  })
  async create(
    @Body() createMinistryDto: CreateMinistryDto,
  ): Promise<Ministry> {
    return this.ministriesService.create(createMinistryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ministry' })
  @ApiBody({ type: UpdateMinistryDto })
  @ApiResponse({
    status: 200,
    description: 'Ministry updated successfully',
    type: MinistryDto,
  })
  @ApiResponse({ status: 404, description: 'Ministry not found' })
  @ApiResponse({
    status: 409,
    description: 'Ministry with this name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMinistryDto: UpdateMinistryDto,
  ): Promise<Ministry> {
    return this.ministriesService.update(id, updateMinistryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a ministry' })
  @ApiResponse({ status: 204, description: 'Ministry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ministry not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.ministriesService.remove(id);
  }
}
