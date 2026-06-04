import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';
import { AssignmentNotificationWorkflow } from './assignment-notification.workflow';

describe('AssignmentNotificationWorkflow', () => {
  const createReferral = (
    overrides: Partial<
      Referral & { assignedTo: { email: string } | null }
    > = {},
  ): Referral =>
    ({
      id: 'ref-123',
      assignedToId: 'user-2',
      specificCityTown: 'Victoria',
      createdAt: new Date('2026-06-01T12:00:00Z'),
      referralStatus: 'ASSIGNED',
      flag: true,
      assignedTo: { email: 'assignee@test.com' },
      ...overrides,
    }) as unknown as Referral;

  it('sends a notification when the assignee changes', async () => {
    const mailService = {
      sendAssignmentNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new AssignmentNotificationWorkflow(mailService);

    await workflow.handle('user-1', createReferral());

    expect(mailService.sendAssignmentNotification).toHaveBeenCalledWith(
      'assignee@test.com',
      {
        referralId: 'ref-123',
        cityTown: 'Victoria',
        createdAt: new Date('2026-06-01T12:00:00Z'),
        status: 'ASSIGNED',
        flagged: true,
      },
    );
  });

  it.each([
    ['no new assignee id', null, createReferral({ assignedToId: null })],
    ['same assignee id', 'user-2', createReferral()],
    [
      'missing assignee relation',
      'user-1',
      createReferral({ assignedTo: null }),
    ],
  ])('does not send when %s', async (_, previousAssigneeId, referral) => {
    const mailService = {
      sendAssignmentNotification: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new AssignmentNotificationWorkflow(mailService);

    await workflow.handle(previousAssigneeId, referral);

    expect(mailService.sendAssignmentNotification).not.toHaveBeenCalled();
  });
});
