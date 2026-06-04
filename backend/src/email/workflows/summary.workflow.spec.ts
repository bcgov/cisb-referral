import { Logger } from '@nestjs/common';
import { SummaryWindow } from '../../cron/summary-window';
import { MailService } from '../../mailer/mail.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SummaryWorkflow } from './summary.workflow';

describe('SummaryWorkflow', () => {
  const window: SummaryWindow = {
    runKind: 'afternoon',
    scheduledAt: new Date('2026-06-02T21:30:00Z'),
    windowStart: new Date('2026-06-02T14:30:00Z'),
    windowEnd: new Date('2026-06-02T21:30:00Z'),
  };

  const createReferral = (
    overrides: Record<string, unknown> = {},
  ): Record<string, unknown> => ({
    id: 'ref-123',
    specificCityTown: 'Prince George',
    createdAt: new Date('2026-06-02T15:00:00Z'),
    referralStatus: 'OPEN',
    flag: false,
    region: {
      id: 'region-1',
      name: 'North',
      managerEmail: ' manager@test.com ',
      supervisorEmail: 'supervisor@test.com',
      assistantSupervisorEmail: 'assistant@test.com',
      sharedMailboxEmail: 'shared@test.com',
    },
    ...overrides,
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('queries referrals with an inclusive start and exclusive end window', async () => {
    const prisma = {
      referral: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;
    const mailService = {
      sendSummaryNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new SummaryWorkflow(prisma, mailService);

    await workflow.handle(window);

    expect(prisma.referral.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          createdAt: {
            gte: window.windowStart,
            lt: window.windowEnd,
          },
          flag: false,
        },
      }),
    );
  });

  it('groups referrals by region and sends one summary per region', async () => {
    const prisma = {
      referral: {
        findMany: jest.fn().mockResolvedValue([
          createReferral(),
          createReferral({
            id: 'ref-456',
            specificCityTown: 'Terrace',
            createdAt: new Date('2026-06-02T16:00:00Z'),
          }),
          createReferral({
            id: 'ref-789',
            region: {
              id: 'region-2',
              name: 'Island',
              managerEmail: null,
              supervisorEmail: null,
              assistantSupervisorEmail: null,
              sharedMailboxEmail: 'island-shared@test.com',
            },
          }),
        ]),
      },
    } as unknown as PrismaService;
    const mailService = {
      sendSummaryNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new SummaryWorkflow(prisma, mailService);

    const result = await workflow.handle(window);

    expect(mailService.sendSummaryNotification).toHaveBeenCalledTimes(2);
    expect(mailService.sendSummaryNotification).toHaveBeenNthCalledWith(
      1,
      [
        'manager@test.com',
        'supervisor@test.com',
        'assistant@test.com',
        'shared@test.com',
      ],
      {
        regionName: 'North',
        windowStart: window.windowStart,
        windowEnd: window.windowEnd,
        rows: [
          {
            referralId: 'ref-123',
            cityTown: 'Prince George',
            createdAt: new Date('2026-06-02T15:00:00Z'),
            status: 'OPEN',
            flagged: false,
          },
          {
            referralId: 'ref-456',
            cityTown: 'Terrace',
            createdAt: new Date('2026-06-02T16:00:00Z'),
            status: 'OPEN',
            flagged: false,
          },
        ],
      },
    );
    expect(mailService.sendSummaryNotification).toHaveBeenNthCalledWith(
      2,
      ['island-shared@test.com'],
      {
        regionName: 'Island',
        windowStart: window.windowStart,
        windowEnd: window.windowEnd,
        rows: [
          {
            referralId: 'ref-789',
            cityTown: 'Prince George',
            createdAt: new Date('2026-06-02T15:00:00Z'),
            status: 'OPEN',
            flagged: false,
          },
        ],
      },
    );
    expect(result).toEqual({
      totalReferrals: 3,
      totalRegions: 2,
      sentRegions: 2,
      skippedRegions: 0,
      failedRegions: 0,
    });
  });

  it('skips regions with no configured recipients and logs the skip', async () => {
    const warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const prisma = {
      referral: {
        findMany: jest.fn().mockResolvedValue([
          createReferral({
            region: {
              id: 'region-1',
              name: 'North',
              managerEmail: ' ',
              supervisorEmail: null,
              assistantSupervisorEmail: null,
              sharedMailboxEmail: null,
            },
          }),
        ]),
      },
    } as unknown as PrismaService;
    const mailService = {
      sendSummaryNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new SummaryWorkflow(prisma, mailService);

    const result = await workflow.handle(window);

    expect(mailService.sendSummaryNotification).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"summary_region_skipped"'),
    );
    expect(result).toEqual({
      totalReferrals: 1,
      totalRegions: 1,
      sentRegions: 0,
      skippedRegions: 1,
      failedRegions: 0,
    });
  });

  it('excludes flagged (urgent) referrals from the summary', async () => {
    const prisma = {
      referral: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            createReferral({ id: 'ref-normal', flag: false }),
          ]),
      },
    } as unknown as PrismaService;
    const mailService = {
      sendSummaryNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new SummaryWorkflow(prisma, mailService);

    await workflow.handle(window);

    expect(prisma.referral.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          flag: false,
        }),
      }),
    );
  });

  it('continues processing when one region send fails', async () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const prisma = {
      referral: {
        findMany: jest.fn().mockResolvedValue([
          createReferral(),
          createReferral({
            id: 'ref-456',
            region: {
              id: 'region-2',
              name: 'Island',
              managerEmail: null,
              supervisorEmail: null,
              assistantSupervisorEmail: null,
              sharedMailboxEmail: 'island-shared@test.com',
            },
          }),
        ]),
      },
    } as unknown as PrismaService;
    const mailService = {
      sendSummaryNotification: jest
        .fn()
        .mockRejectedValueOnce(new Error('smtp failure'))
        .mockResolvedValueOnce(undefined),
    } as unknown as MailService;
    const workflow = new SummaryWorkflow(prisma, mailService);

    const result = await workflow.handle(window);

    expect(mailService.sendSummaryNotification).toHaveBeenCalledTimes(2);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"summary_region_failed"'),
    );
    expect(result).toEqual({
      totalReferrals: 2,
      totalRegions: 2,
      sentRegions: 1,
      skippedRegions: 0,
      failedRegions: 1,
    });
  });
});
