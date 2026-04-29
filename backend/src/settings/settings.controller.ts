import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AdminColumnsDto } from './dto/admin-columns.dto';
import { AdminAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import type { User } from '../generated/prisma/client';

@ApiTags('settings')
@ApiBearerAuth()
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('admin-columns')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary:
      'Get the shared list of visible columns for the admin referrals view',
  })
  @ApiResponse({ status: 200, description: 'Ordered column key list' })
  async getAdminColumns(): Promise<AdminColumnsDto> {
    const columns = await this.settingsService.getAdminColumns();
    return { columns };
  }

  @Put('admin-columns')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary:
      'Update the shared list of visible columns for the admin referrals view',
  })
  @ApiResponse({ status: 200, description: 'Saved column key list' })
  async setAdminColumns(
    @Body() dto: AdminColumnsDto,
    @CurrentUser() user: User,
  ): Promise<AdminColumnsDto> {
    const columns = await this.settingsService.setAdminColumns(
      dto.columns,
      user.id,
    );
    return { columns };
  }
}
