import { Referral } from '../../generated/prisma/client';
import { MailService } from '../../mailer/mail.service';
import { AutomaticReplyWorkflow } from './automatic-reply.workflow';

describe('AutomaticReplyWorkflow', () => {
  const createReferral = (): Referral =>
    ({ id: 'ref-123' }) as unknown as Referral;

  it('forwards the referral to the mail service', async () => {
    const mailService = {
      sendAutomaticReply: jest.fn().mockResolvedValue(undefined),
    } as unknown as MailService;
    const workflow = new AutomaticReplyWorkflow(mailService);
    const referral = createReferral();

    await workflow.handle(referral);

    expect(mailService.sendAutomaticReply).toHaveBeenCalledTimes(1);
    expect(mailService.sendAutomaticReply).toHaveBeenCalledWith(referral);
  });
});
