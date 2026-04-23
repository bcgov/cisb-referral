import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { MailConfigService } from './mail.config';
import { renderAutomaticReply } from './templates/automatic-reply';
import {
  AssignmentNotificationParams,
  renderAssignmentNotification,
} from './templates/assignment-notification';
import {
  RegionChangeNotificationParams,
  renderRegionChangeNotification,
} from './templates/region-change-notification';
import {
  UrgentNotificationParams,
  renderUrgentNotification,
} from './templates/urgent-notification';
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
    if (this.skipIfDisabled(`automatic reply for referral ${referral.id}`))
      return;
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
    if (
      this.skipIfDisabled(`assignment notification for referral ${data.referralId}`)
    )
      return;
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
      `Assignment notification sent for referral ${data.referralId} to 1 recipient (messageId=${info.messageId})`,
    );
  }

  async sendUrgentNotification(
    to: string[],
    data: Omit<UrgentNotificationParams, 'referralUrl'>,
  ): Promise<void> {
    if (
      this.skipIfDisabled(`urgent notification for referral ${data.referralId}`)
    )
      return;
    const referralUrl = `${this.mailConfig.getAdminAppUrl()}/referrals/${data.referralId}`;
    const { subject, text, html } = renderUrgentNotification({
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
      `Urgent notification sent for referral ${data.referralId} to ${to.length} recipients (messageId=${info.messageId})`,
    );
  }

  async sendRegionChangeNotification(
    to: string[],
    data: Omit<RegionChangeNotificationParams, 'referralUrl'>,
  ): Promise<void> {
    if (
      this.skipIfDisabled(
        `region change notification for referral ${data.referralId}`,
      )
    )
      return;
    const referralUrl = `${this.mailConfig.getAdminAppUrl()}/referrals/${data.referralId}`;
    const { subject, text, html } = renderRegionChangeNotification({
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
      `Region change notification sent for referral ${data.referralId} to ${to.length} recipients (messageId=${info.messageId})`,
    );
  }

  private skipIfDisabled(context: string): boolean {
    if (this.mailConfig.isMailEnabled()) return false;
    this.logger.warn(`MAIL_ENABLED=false; skipping ${context}`);
    return true;
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
