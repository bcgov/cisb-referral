import { Test, TestingModule } from '@nestjs/testing';
import * as nodemailer from 'nodemailer';
import { MailService } from './mail.service';
import { MailConfigService } from './mail.config';
import { Referral } from '../generated/prisma/client';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let mockMailConfig: {
    isMailEnabled: jest.Mock;
    getSmtpConfig: jest.Mock;
    getAdminAppUrl: jest.Mock;
  };
  let sendMail: jest.Mock;
  let createTransport: jest.MockedFunction<typeof nodemailer.createTransport>;

  const baseReferral = {
    id: 'ref-123',
    referrerEmail: 'referrer@example.com',
    referrerContactName: 'Pat Referrer',
    individualFirstName: 'Alex',
    individualLastName: 'Client',
    specificCityTown: 'Vancouver',
    referralStatus: 'OPEN',
    flag: false,
    createdAt: new Date('2026-04-21T15:30:00Z'),
  } as unknown as Referral;

  beforeEach(async () => {
    sendMail = jest.fn().mockResolvedValue({ messageId: '<abc@test>' });
    createTransport = nodemailer.createTransport as jest.MockedFunction<
      typeof nodemailer.createTransport
    >;
    createTransport.mockReturnValue({ sendMail } as unknown as ReturnType<
      typeof nodemailer.createTransport
    >);

    mockMailConfig = {
      isMailEnabled: jest.fn().mockReturnValue(true),
      getSmtpConfig: jest.fn().mockReturnValue({
        host: 'smtp.test',
        port: 25,
        secure: false,
        from: 'CISB <no-reply@test>',
      }),
      getAdminAppUrl: jest.fn().mockReturnValue('https://admin.test'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailConfigService, useValue: mockMailConfig },
      ],
    }).compile();

    service = module.get(MailService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('kill switch (MAIL_ENABLED)', () => {
    beforeEach(() => {
      mockMailConfig.isMailEnabled.mockReturnValue(false);
    });

    it('does not send automatic reply when disabled', async () => {
      await service.sendAutomaticReply(baseReferral);
      expect(sendMail).not.toHaveBeenCalled();
      expect(createTransport).not.toHaveBeenCalled();
    });

    it('does not send assignment notification when disabled', async () => {
      await service.sendAssignmentNotification('assignee@test', {
        referralId: 'ref-123',
        cityTown: 'Vancouver',
        createdAt: baseReferral.createdAt,
        status: 'ASSIGNED',
        flagged: false,
      });
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('does not send region change notification when disabled', async () => {
      await service.sendRegionChangeNotification(['sup@test'], {
        referralId: 'ref-123',
        cityTown: 'Vancouver',
        createdAt: baseReferral.createdAt,
        status: 'OPEN',
        flagged: false,
      });
      expect(sendMail).not.toHaveBeenCalled();
    });

    it('does not send urgent notification when disabled', async () => {
      await service.sendUrgentNotification(['mgr@test'], {
        referralId: 'ref-123',
        cityTown: 'Vancouver',
        createdAt: baseReferral.createdAt,
        status: 'OPEN',
        flagged: true,
      });
      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe('sendAutomaticReply', () => {
    it('sends to the referrer email with expected from/subject', async () => {
      await service.sendAutomaticReply(baseReferral);

      expect(sendMail).toHaveBeenCalledTimes(1);
      const args = sendMail.mock.calls[0][0];
      expect(args.to).toBe('referrer@example.com');
      expect(args.from).toBe('CISB <no-reply@test>');
      expect(args.subject).toBeTruthy();
      expect(args.html).toBeTruthy();
      expect(args.text).toBeTruthy();
    });
  });

  describe('sendAssignmentNotification', () => {
    it('sends to the assignee and includes admin URL in the rendered body', async () => {
      await service.sendAssignmentNotification('assignee@test', {
        referralId: 'ref-123',
        cityTown: 'Vancouver',
        createdAt: baseReferral.createdAt,
        status: 'ASSIGNED',
        flagged: false,
      });

      expect(sendMail).toHaveBeenCalledTimes(1);
      const args = sendMail.mock.calls[0][0];
      expect(args.to).toBe('assignee@test');
      expect(args.html).toContain('https://admin.test/referrals/ref-123');
      expect(args.subject).toContain('ref-123');
    });
  });

  describe('sendRegionChangeNotification', () => {
    it('passes all recipients on the to line', async () => {
      await service.sendRegionChangeNotification(
        ['supervisor@test', 'shared@test'],
        {
          referralId: 'ref-123',
          cityTown: 'Vancouver',
          createdAt: baseReferral.createdAt,
          status: 'OPEN',
          flagged: false,
        },
      );

      const args = sendMail.mock.calls[0][0];
      expect(args.to).toEqual(['supervisor@test', 'shared@test']);
    });
  });

  describe('sendUrgentNotification', () => {
    it('passes all recipients on the to line and marks subject as URGENT', async () => {
      await service.sendUrgentNotification(
        ['mgr@test', 'sup@test', 'asst@test', 'shared@test'],
        {
          referralId: 'ref-123',
          cityTown: 'Vancouver',
          createdAt: baseReferral.createdAt,
          status: 'OPEN',
          flagged: true,
        },
      );

      const args = sendMail.mock.calls[0][0];
      expect(args.to).toHaveLength(4);
      expect(args.subject).toMatch(/^URGENT Referral/);
    });
  });

  describe('transporter reuse', () => {
    it('creates the transporter once across multiple sends', async () => {
      await service.sendAutomaticReply(baseReferral);
      await service.sendAutomaticReply(baseReferral);
      await service.sendAutomaticReply(baseReferral);
      expect(createTransport).toHaveBeenCalledTimes(1);
    });
  });
});
