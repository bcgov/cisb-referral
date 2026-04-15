import {
  Controller,
  Get,
  Query,
  Param,
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
import { AuditService } from './audit.service';
import { AuditLogDto, ReferralAuditLogDto } from './dto/audit-log.dto';
import { UserRole } from '../generated/prisma/client';
import { AdminAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

@ApiTags('audit')
@ApiBearerAuth()
@Controller({ version: '1' })
@UseGuards(AdminAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('audit-logs')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Get global audit logs' })
  @ApiQuery({
    name: 'tableName',
    required: false,
    type: String,
    description: 'Filter by table name (user, ministry, agency_type, region)',
  })
  @ApiQuery({
    name: 'recordId',
    required: false,
    type: String,
    description: 'Filter by record ID',
  })
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
    description: 'Items per page (default: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated audit logs',
    type: [AuditLogDto],
  })
  async findGlobalLogs(
    @Query('tableName') tableName?: string,
    @Query('recordId') recordId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditService.findGlobalLogs({
      tableName,
      recordId,
      page: page ? Number.parseInt(page, 10) : undefined,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
    });
  }

  @Get('referrals/:id/audit')
  @Roles(UserRole.SYSTEM_ADMINISTRATOR)
  @ApiOperation({ summary: 'Get audit history for a referral' })
  @ApiResponse({
    status: 200,
    description: 'Referral audit history',
    type: [ReferralAuditLogDto],
  })
  @ApiResponse({ status: 404, description: 'Referral not found' })
  async findReferralLogs(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findReferralLogs(id);
  }
}
