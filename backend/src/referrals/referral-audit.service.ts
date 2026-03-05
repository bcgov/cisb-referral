import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '../generated/prisma/client';

/**
 * Describes a single field-level change on a referral
 */
export interface AuditChange {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

/**
 * Service responsible for creating and querying referral audit log entries.
 * Each entry tracks a single field change with old/new values and who made it.
 */
@Injectable()
export class ReferralAuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bulk-insert audit log entries for a set of field changes
   * @param referralId - The referral being changed
   * @param action - CREATE or UPDATE
   * @param changes - Array of field-level changes to record
   * @param userId - The user who made the changes
   */
  async createAuditEntries(
    referralId: string,
    action: AuditAction,
    changes: AuditChange[],
    userId?: string,
  ): Promise<void> {
    if (changes.length === 0) {
      return;
    }

    await this.prisma.referralAuditLog.createMany({
      data: changes.map((change) => ({
        referralId,
        action,
        fieldChanged: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        changedBy: userId,
      })),
    });
  }

  /**
   * Fetch paginated audit log entries for a referral, newest first
   * @param referralId - The referral to fetch audit entries for
   * @param page - Page number (1-based)
   * @param limit - Items per page
   */
  async findByReferralId(
    referralId: string,
    page = 1,
    limit = 50,
  ): Promise<{
    data: Array<{
      id: string;
      referralId: string;
      action: AuditAction;
      fieldChanged: string;
      oldValue: string | null;
      newValue: string | null;
      comment: string | null;
      changedBy: string | null;
      changedByUser: { id: string; fullName: string } | null;
      changedAt: Date;
    }>;
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.referralAuditLog.findMany({
        where: { referralId },
        skip,
        take: limit,
        orderBy: { changedAt: 'desc' },
        include: {
          changedByUser: {
            select: { id: true, fullName: true },
          },
        },
      }),
      this.prisma.referralAuditLog.count({ where: { referralId } }),
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
}
