import { Injectable } from '@nestjs/common';
import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';

@Injectable()
export class AutomaticReplyWorkflow {
  constructor(private readonly mailService: MailService) {}

  async handle(referral: Referral): Promise<void> {
    await this.mailService.sendAutomaticReply(referral);
  }
}
