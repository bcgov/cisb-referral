import { Logger } from '@nestjs/common';
import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';
import { UrgentNotificationWorkflow } from './urgent-notification.workflow';

describe('UrgentNotificationWorkflow', () => {
  const createReferral = (
    overrides: Partial<
      Referral & {
        region: {
          managerEmail: string | null;
          supervisorEmail: string | null;
          assistantSupervisorEmail: string | null;
          sharedMailboxEmail: string | null;
        } | null;
      }
    > = {},
  ): Referral =>
    ({
      id: 'ref-123',
      flag: true,
      specificCityTown: 'Prince George',
      createdAt: new Date('2026-06-01T12:00:00Z'),
      referralStatus: 'OPEN',
      region: {
        managerEmail: ' manager@test.com ',
        supervisorEmail: 'supervisor@test.com',
        assistantSupervisorEmail: 'assistant@test.com',
        sharedMailboxEmail: 'shared@test.com',
      },
      ...overrides,
    }) as unknown as Referral;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not send when the referral is not flagged urgent', async () => {
    const mailService = {
      sendUrgentNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new UrgentNotificationWorkflow(mailService);

    await workflow.handle(createReferral({ flag: false }));

    expect(mailService.sendUrgentNotification).not.toHaveBeenCalled();
  });

  it('sends to trimmed region recipients when the referral is urgent', async () => {
    const mailService = {
      sendUrgentNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new UrgentNotificationWorkflow(mailService);

    await workflow.handle(createReferral());

    expect(mailService.sendUrgentNotification).toHaveBeenCalledWith(
      [
        'manager@test.com',
        'supervisor@test.com',
        'assistant@test.com',
        'shared@test.com',
      ],
      {
        referralId: 'ref-123',
        cityTown: 'Prince George',
        createdAt: new Date('2026-06-01T12:00:00Z'),
        status: 'OPEN',
        flagged: true,
      },
    );
  });

  it.each([
    [
      'has no region',
      createReferral({ region: null }),
      'Urgent referral ref-123 has no region associated; skipping urgent notification',
    ],
    [
      'has no configured recipients',
      createReferral({
        region: {
          managerEmail: ' ',
          supervisorEmail: null,
          assistantSupervisorEmail: null,
          sharedMailboxEmail: null,
        },
      }),
      'Urgent referral ref-123 but region has no manager, supervisor, assistant supervisor, or shared mailbox configured',
    ],
  ])(
    'warns and skips when the urgent referral %s',
    async (_, referral, message) => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      const mailService = {
        sendUrgentNotification: jest.fn().mockResolvedValue(undefined),
      } as unknown as MailService;
      const workflow = new UrgentNotificationWorkflow(mailService);

      await workflow.handle(referral);

      expect(mailService.sendUrgentNotification).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(message);
    },
  );
});
