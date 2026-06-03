import { Injectable } from '@nestjs/common';
import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';

@Injectable()
export class AssignmentNotificationWorkflow {
  constructor(private readonly mailService: MailService) {}

  async handle(
    previousAssigneeId: string | null,
    updated: Referral,
  ): Promise<void> {
    const assignee = (
      updated as Referral & { assignedTo: { email: string } | null }
    ).assignedTo;
    const newAssigneeId = updated.assignedToId;

    if (!newAssigneeId || newAssigneeId === previousAssigneeId || !assignee) {
      return;
    }

    await this.mailService.sendAssignmentNotification(assignee.email, {
      referralId: updated.id,
      cityTown: updated.specificCityTown,
      createdAt: updated.createdAt,
      status: updated.referralStatus,
      flagged: updated.flag,
    });
  }
}
