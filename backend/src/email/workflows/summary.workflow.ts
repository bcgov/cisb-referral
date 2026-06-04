import { Injectable, Logger } from '@nestjs/common';
import { MailService } from '../../mailer/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SummaryWindow } from '../../cron/summary-window';

interface RegionRecipients {
  id: string;
  name: string;
  managerEmail: string | null;
  supervisorEmail: string | null;
  assistantSupervisorEmail: string | null;
  sharedMailboxEmail: string | null;
}

interface SummaryReferral {
  id: string;
  specificCityTown: string;
  createdAt: Date;
  referralStatus: string;
  flag: boolean;
  region: RegionRecipients;
}

interface RegionSummaryGroup {
  region: RegionRecipients;
  rows: SummaryReferral[];
}

export interface SummaryWorkflowResult {
  totalReferrals: number;
  totalRegions: number;
  sentRegions: number;
  skippedRegions: number;
  failedRegions: number;
}

@Injectable()
export class SummaryWorkflow {
  private readonly logger = new Logger('REFERRALS');

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async handle(window: SummaryWindow): Promise<SummaryWorkflowResult> {
    const referrals = await this.prisma.referral.findMany({
      where: {
        createdAt: {
          gte: window.windowStart,
          lt: window.windowEnd,
        },
        flag: false,
      },
      select: {
        id: true,
        specificCityTown: true,
        createdAt: true,
        referralStatus: true,
        flag: true,
        region: {
          select: {
            id: true,
            name: true,
            managerEmail: true,
            supervisorEmail: true,
            assistantSupervisorEmail: true,
            sharedMailboxEmail: true,
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });

    if (referrals.length === 0) {
      this.log('log', 'summary_run_empty', {
        runKind: window.runKind,
        windowStart: window.windowStart.toISOString(),
        windowEnd: window.windowEnd.toISOString(),
      });
      return {
        totalReferrals: 0,
        totalRegions: 0,
        sentRegions: 0,
        skippedRegions: 0,
        failedRegions: 0,
      };
    }

    const groups = this.groupByRegion(referrals);
    const result: SummaryWorkflowResult = {
      totalReferrals: referrals.length,
      totalRegions: groups.length,
      sentRegions: 0,
      skippedRegions: 0,
      failedRegions: 0,
    };

    for (const group of groups) {
      const recipients = this.resolveRecipients(group.region);
      if (recipients.length === 0) {
        result.skippedRegions += 1;
        this.log('warn', 'summary_region_skipped', {
          regionId: group.region.id,
          regionName: group.region.name,
          reason: 'missing_recipients',
          windowStart: window.windowStart.toISOString(),
          windowEnd: window.windowEnd.toISOString(),
        });
        continue;
      }

      try {
        await this.mailService.sendSummaryNotification(recipients, {
          regionName: group.region.name,
          windowStart: window.windowStart,
          windowEnd: window.windowEnd,
          rows: group.rows.map((referral) => ({
            referralId: referral.id,
            cityTown: referral.specificCityTown,
            createdAt: referral.createdAt,
            status: referral.referralStatus,
            flagged: referral.flag,
          })),
        });
        result.sentRegions += 1;
        this.log('log', 'summary_region_sent', {
          regionId: group.region.id,
          regionName: group.region.name,
          recipientCount: recipients.length,
          referralCount: group.rows.length,
          windowStart: window.windowStart.toISOString(),
          windowEnd: window.windowEnd.toISOString(),
        });
      } catch {
        result.failedRegions += 1;
        this.log('error', 'summary_region_failed', {
          regionId: group.region.id,
          regionName: group.region.name,
          recipientCount: recipients.length,
          referralCount: group.rows.length,
          windowStart: window.windowStart.toISOString(),
          windowEnd: window.windowEnd.toISOString(),
          errorCode: 'SEND_FAILED',
        });
      }
    }

    this.log('log', 'summary_run_completed', {
      runKind: window.runKind,
      windowStart: window.windowStart.toISOString(),
      windowEnd: window.windowEnd.toISOString(),
      ...result,
    });

    return result;
  }

  private groupByRegion(referrals: SummaryReferral[]): RegionSummaryGroup[] {
    const groups = new Map<string, RegionSummaryGroup>();

    for (const referral of referrals) {
      const existing = groups.get(referral.region.id);
      if (existing) {
        existing.rows.push(referral);
        continue;
      }

      groups.set(referral.region.id, {
        region: referral.region,
        rows: [referral],
      });
    }

    return Array.from(groups.values());
  }

  private resolveRecipients(region: RegionRecipients): string[] {
    return Array.from(
      new Set(
        [
          region.managerEmail,
          region.supervisorEmail,
          region.assistantSupervisorEmail,
          region.sharedMailboxEmail,
        ]
          .map((email) => email?.trim())
          .filter((email): email is string => Boolean(email)),
      ),
    );
  }

  private log(
    level: 'log' | 'warn' | 'error',
    event: string,
    details: Record<string, unknown>,
  ): void {
    const payload = JSON.stringify({ event, ...details });

    if (level === 'error') {
      this.logger.error(payload);
      return;
    }

    this.logger[level](payload);
  }
}
