import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { MailConfigService } from './mail.config';
import { renderAutomaticReply } from './templates/automatic-reply';
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
