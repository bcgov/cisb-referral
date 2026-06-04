import type { RenderedEmail } from './automatic-reply';
import {
  ReferralSummaryRow,
  formatReferralSummary,
  renderReferralSummaryHtmlTable,
  renderReferralSummaryTextLines,
} from './referral-summary-table';

export type AssignmentNotificationParams = ReferralSummaryRow;

export function renderAssignmentNotification(
  params: AssignmentNotificationParams,
): RenderedEmail {
  const s = formatReferralSummary(params);

  const subject = `Referral Assignment (${s.when}) (${s.referralId})`;

  const text = [
    'Hello,',
    '',
    'You have been assigned the following referral:',
    '',
    ...renderReferralSummaryTextLines(s),
    '',
    'Please attend to accordingly.',
  ].join('\n');

  const html = `
    <p>Hello,</p>
    <p>You have been assigned the following referral:</p>
    ${renderReferralSummaryHtmlTable(s)}
    <p>Please attend to accordingly.</p>
  `.trim();

  return { subject, text, html };
}
