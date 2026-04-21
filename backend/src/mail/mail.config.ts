import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  password?: string;
  from: string;
}

@Injectable()
export class MailConfigService {
  constructor(private readonly configService: ConfigService) {}

  getSmtpConfig(): SmtpConfig {
    const user = this.configService.get<string>('SMTP_USER')?.trim() || undefined;
    const password =
      this.configService.get<string>('SMTP_PASSWORD')?.trim() || undefined;

    return {
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number.parseInt(
        this.configService.getOrThrow<string>('SMTP_PORT'),
        10,
      ),
      secure:
        this.configService.getOrThrow<string>('SMTP_SECURE').toLowerCase() ===
        'true',
      user,
      password,
      from: this.configService.getOrThrow<string>('SMTP_FROM'),
    };
  }

  getAdminAppUrl(): string {
    return this.configService
      .getOrThrow<string>('ADMIN_APP_URL')
      .replace(/\/+$/, '');
  }
}
