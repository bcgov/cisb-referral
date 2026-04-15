import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLog, ReferralAuditLog } from '../generated/prisma/client';
import { FieldChange } from './audit.utils';

export interface GlobalAuditParams {
  tableName: string;
  recordId: string;
  action: string;
  changes?: FieldChange[];
  userId?: string;
}

export interface ReferralAuditParams {
  referralId: string;
  action: string;
  changes?: FieldChange[];
  userId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log one or more global audit entries (users, ministries, etc.).
   * For CREATE/DELETE: a single entry with the record identifier.
   * For UPDATE: one entry per changed field.
   */
  async logGlobal(params: GlobalAuditParams): Promise<void> {
    const { tableName, recordId, action, changes, userId } = params;

    if (changes && changes.length > 0) {
      await this.prisma.auditLog.createMany({
        data: changes.map((change) => ({
          tableName,
          recordId,
          action,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          createdBy: userId,
        })),
      });
    } else {
      await this.prisma.auditLog.create({
        data: {
          tableName,
          recordId,
          action,
          createdBy: userId,
        },
      });
    }
  }

  /**
   * Log one or more referral audit entries.
   * For CREATE: a single entry marking creation.
   * For UPDATE: one entry per changed field.
   */
  async logReferralChange(params: ReferralAuditParams): Promise<void> {
    const { referralId, action, changes, userId } = params;

    if (changes && changes.length > 0) {
      await this.prisma.referralAuditLog.createMany({
        data: changes.map((change) => ({
          referralId,
          action,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          createdBy: userId,
        })),
      });
    } else {
      await this.prisma.referralAuditLog.create({
        data: {
          referralId,
          action,
          createdBy: userId,
        },
      });
    }
  }

  /**
   * Query global audit logs with optional filters and pagination.
   */
  async findGlobalLogs(filters: {
    tableName?: string;
    recordId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: AuditLog[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { tableName, recordId, page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      ...(tableName && { tableName }),
      ...(recordId && { recordId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, fullName: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all audit log entries for a specific referral.
   */
  async findReferralLogs(referralId: string): Promise<ReferralAuditLog[]> {
    return this.prisma.referralAuditLog.findMany({
      where: { referralId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, fullName: true } } },
    });
  }
}
