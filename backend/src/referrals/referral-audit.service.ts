import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '../generated/prisma/client';

/** Maximum number of audit entries that can be returned per page */
const MAX_PAGE_LIMIT = 100;

/** Minimum valid page number */
const MIN_PAGE = 1;

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
  private readonly logger = new Logger(ReferralAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bulk-insert audit log entries for a set of field changes
   * @param referralId - The referral being changed
   * @param action - CREATE or UPDATE
   * @param changes - Array of field-level changes to record
   * @param userEmail - Email of the user who made the changes
   */
  async createAuditEntries(
    referralId: string,
    action: AuditAction,
    changes: AuditChange[],
    userEmail?: string,
  ): Promise<void> {
    if (changes.length === 0) {
      return;
    }

    try {
      await this.prisma.referralAuditLog.createMany({
        data: changes.map((change) => ({
          referralId,
          action,
          fieldChanged: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          changedBy: userEmail ?? 'system',
        })),
      });

      this.logger.log(
        `Created ${changes.length} audit entries for referral ${referralId} [${action}]`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to create audit entries for referral ${referralId}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
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
      changedAt: Date;
    }>;
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const safePage = Math.max(MIN_PAGE, page);
    const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
    const skip = (safePage - 1) * safeLimit;

    const [data, total] = await Promise.all([
      this.prisma.referralAuditLog.findMany({
        where: { referralId },
        skip,
        take: safeLimit,
        orderBy: { changedAt: 'desc' },
      }),
      this.prisma.referralAuditLog.count({ where: { referralId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}
