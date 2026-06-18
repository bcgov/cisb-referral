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
  SummaryNotificationParams,
  renderSummaryNotification,
} from './templates/summary-notification';
import {
  UrgentNotificationParams,
  renderUrgentNotification,
} from './templates/urgent-notification';
import { Referral } from '../generated/prisma/client';

interface ResolvedTransport {
  transporter: Transporter;
  from: string;
}

interface RenderedMessage {
  subject: string;
  text: string;
  html: string;
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
    await this.sendRenderedEmail(referral.referrerEmail, {
      subject,
      text,
      html,
    });

    this.logger.log(
      `Automatic reply sent for referral ${referral.id}`,
    );
  }

  async sendAssignmentNotification(
    to: string,
    data: Omit<AssignmentNotificationParams, 'referralUrl'>,
  ): Promise<void> {
    if (
      this.skipIfDisabled(
        `assignment notification for referral ${data.referralId}`,
      )
    )
      return;
    const referralUrl = `${this.mailConfig.getAdminAppUrl()}/referrals/${data.referralId}`;
    const { subject, text, html } = renderAssignmentNotification({
      ...data,
      referralUrl,
    });
    await this.sendRenderedEmail(to, { subject, text, html });

    this.logger.log(
      `Assignment notification sent for referral ${data.referralId} to 1 recipient`,
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
    await this.sendRenderedEmail(to, { subject, text, html });

    this.logger.log(
      `Urgent notification sent for referral ${data.referralId} to ${to.length} recipients`,
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
    await this.sendRenderedEmail(to, { subject, text, html });

    this.logger.log(
      `Region change notification sent for referral ${data.referralId} to ${to.length} recipients`,
    );
  }

  async sendSummaryNotification(
    to: string[],
    data: Omit<SummaryNotificationParams, 'referralUrlBase'>,
  ): Promise<void> {
    if (
      this.skipIfDisabled(
        `summary notification for region ${data.regionName} (${data.rows.length} referrals)`,
      )
    )
      return;
    const { subject, text, html } = renderSummaryNotification({
      ...data,
      referralUrlBase: `${this.mailConfig.getAdminAppUrl()}/referrals`,
    });
    await this.sendRenderedEmail(to, { subject, text, html });

    this.logger.log(
      `Summary notification sent for region ${data.regionName} to ${to.length} recipients covering ${data.rows.length} referrals`,
    );
  }

  private skipIfDisabled(context: string): boolean {
    if (this.mailConfig.isMailEnabled()) return false;
    this.logger.warn(`MAIL_ENABLED=false; skipping ${context}`);
    return true;
  }

  private async sendRenderedEmail(
    to: string | string[],
    message: RenderedMessage,
  ): Promise<void> {
    const { transporter, from } = this.getTransport();

    await transporter.sendMail({
      from,
      to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
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
