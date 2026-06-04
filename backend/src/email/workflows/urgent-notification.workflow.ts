import { Injectable, Logger } from '@nestjs/common';
import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';

@Injectable()
export class UrgentNotificationWorkflow {
  private readonly logger = new Logger('REFERRALS');

  constructor(private readonly mailService: MailService) {}

  async handle(referral: Referral): Promise<void> {
    if (!referral.flag) return;

    const region = (
      referral as Referral & {
        region: {
          managerEmail: string | null;
          supervisorEmail: string | null;
          assistantSupervisorEmail: string | null;
          sharedMailboxEmail: string | null;
        } | null;
      }
    ).region;

    if (!region) {
      this.logger.warn(
        `Urgent referral ${referral.id} has no region associated; skipping urgent notification`,
      );
      return;
    }

    const recipients = [
      region.managerEmail?.trim(),
      region.supervisorEmail?.trim(),
      region.assistantSupervisorEmail?.trim(),
      region.sharedMailboxEmail?.trim(),
    ].filter((email): email is string => Boolean(email));

    if (recipients.length === 0) {
      this.logger.warn(
        `Urgent referral ${referral.id} but region has no manager, supervisor, assistant supervisor, or shared mailbox configured`,
      );
      return;
    }

    await this.mailService.sendUrgentNotification(recipients, {
      referralId: referral.id,
      cityTown: referral.specificCityTown,
      createdAt: referral.createdAt,
      status: referral.referralStatus,
      flagged: referral.flag,
    });
  }
}
