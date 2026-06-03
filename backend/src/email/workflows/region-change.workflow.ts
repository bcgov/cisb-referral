import { Injectable, Logger } from '@nestjs/common';
import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';

@Injectable()
export class RegionChangeWorkflow {
  private readonly logger = new Logger('REFERRALS');

  constructor(private readonly mailService: MailService) {}

  async handle(previousRegionId: string, updated: Referral): Promise<void> {
    if (updated.regionId === previousRegionId) return;

    const region = (
      updated as Referral & {
        region: {
          supervisorEmail: string | null;
          sharedMailboxEmail: string | null;
        };
      }
    ).region;

    const recipients = [
      region.supervisorEmail?.trim(),
      region.sharedMailboxEmail?.trim(),
    ].filter((email): email is string => Boolean(email));

    if (recipients.length === 0) {
      this.logger.warn(
        `Region change for referral ${updated.id} but new region has no supervisor or shared mailbox configured`,
      );
      return;
    }

    await this.mailService.sendRegionChangeNotification(recipients, {
      referralId: updated.id,
      cityTown: updated.specificCityTown,
      createdAt: updated.createdAt,
      status: updated.referralStatus,
      flagged: updated.flag,
    });
  }
}
