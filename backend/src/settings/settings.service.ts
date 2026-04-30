import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const ADMIN_COLUMNS_KEY = 'referrals.adminColumns';

const DEFAULT_ADMIN_COLUMNS = [
  'flag',
  'createdAt',
  'referrerContactName',
  'referredBy',
  'referralStatus',
  'referralOutcome',
  'individualFirstName',
  'individualLastName',
  'region',
  'specificCityTown',
  'assignedTo',
];

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminColumns(): Promise<string[]> {
    const setting = await this.prisma.appSetting.findUnique({
      where: { key: ADMIN_COLUMNS_KEY },
    });

    if (!setting) {
      return DEFAULT_ADMIN_COLUMNS;
    }

    const value = setting.value;
    if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
      return value;
    }
    return DEFAULT_ADMIN_COLUMNS;
  }

  async setAdminColumns(columns: string[], userId?: string): Promise<string[]> {
    await this.prisma.appSetting.upsert({
      where: { key: ADMIN_COLUMNS_KEY },
      create: {
        key: ADMIN_COLUMNS_KEY,
        value: columns,
        updatedBy: userId,
      },
      update: {
        value: columns,
        updatedBy: userId,
      },
    });
    return columns;
  }
}
