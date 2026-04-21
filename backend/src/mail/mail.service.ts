import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { MailConfigService } from './mail.config';
import { renderAutomaticReply } from './templates/automatic-reply';
import {
  AssignmentNotificationParams,
  renderAssignmentNotification,
} from './templates/assignment-notification';
import { Referral } from '../generated/prisma/client';

interface ResolvedTransport {
  transporter: Transporter;
  from: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger('MAIL');
  private resolved: ResolvedTransport | null = null;

  constructor(private readonly mailConfig: MailConfigService) {}

  async sendAutomaticReply(referral: Referral): Promise<void> {
    const { subject, text, html } = renderAutomaticReply(referral);
    const { transporter, from } = this.getTransport();

    const info = await transporter.sendMail({
      from,
      to: referral.referrerEmail,
      subject,
      text,
      html,
    });

    this.logger.log(
      `Automatic reply sent for referral ${referral.id} (messageId=${info.messageId})`,
    );
  }

  async sendAssignmentNotification(
    to: string,
    data: Omit<AssignmentNotificationParams, 'referralUrl'>,
  ): Promise<void> {
    const referralUrl = `${this.mailConfig.getAdminAppUrl()}/referrals/${data.referralId}`;
    const { subject, text, html } = renderAssignmentNotification({
      ...data,
      referralUrl,
    });
    const { transporter, from } = this.getTransport();

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    this.logger.log(
      `Assignment notification sent for referral ${data.referralId} to ${to} (messageId=${info.messageId})`,
    );
  }

  private getTransport(): ResolvedTransport {
    if (this.resolved) return this.resolved;

    const cfg = this.mailConfig.getSmtpConfig();
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      requireTLS: true,
      tls: { rejectUnauthorized: false },
      auth:
        cfg.user && cfg.password
          ? { user: cfg.user, pass: cfg.password }
          : undefined,
    });

    this.resolved = { transporter, from: cfg.from };
    return this.resolved;
  }
}
