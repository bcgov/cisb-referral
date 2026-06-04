import { Logger } from '@nestjs/common';
import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';
import { RegionChangeWorkflow } from './region-change.workflow';

describe('RegionChangeWorkflow', () => {
  const createReferral = (
    overrides: Partial<
      Referral & {
        region: {
          supervisorEmail: string | null;
          sharedMailboxEmail: string | null;
        };
      }
    > = {},
  ): Referral =>
    ({
      id: 'ref-123',
      regionId: 'region-2',
      specificCityTown: 'Kamloops',
      createdAt: new Date('2026-06-01T12:00:00Z'),
      referralStatus: 'OPEN',
      flag: false,
      region: {
        supervisorEmail: ' supervisor@test.com ',
        sharedMailboxEmail: 'shared@test.com',
      },
      ...overrides,
    }) as unknown as Referral;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends to trimmed region recipients when the region changes', async () => {
    const mailService = {
      sendRegionChangeNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new RegionChangeWorkflow(mailService);

    await workflow.handle('region-1', createReferral());

    expect(mailService.sendRegionChangeNotification).toHaveBeenCalledWith(
      ['supervisor@test.com', 'shared@test.com'],
      {
        referralId: 'ref-123',
        cityTown: 'Kamloops',
        createdAt: new Date('2026-06-01T12:00:00Z'),
        status: 'OPEN',
        flagged: false,
      },
    );
  });

  it('does not send when the region is unchanged', async () => {
    const mailService = {
      sendRegionChangeNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new RegionChangeWorkflow(mailService);

    await workflow.handle('region-2', createReferral());

    expect(mailService.sendRegionChangeNotification).not.toHaveBeenCalled();
  });

  it('warns and skips when the new region has no recipients', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const mailService = {
      sendRegionChangeNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new RegionChangeWorkflow(mailService);

    await workflow.handle(
      'region-1',
      createReferral({
        region: {
          supervisorEmail: ' ',
          sharedMailboxEmail: null,
        },
      }),
    );

    expect(mailService.sendRegionChangeNotification).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'Region change for referral ref-123 but new region has no supervisor or shared mailbox configured',
    );
  });
});
