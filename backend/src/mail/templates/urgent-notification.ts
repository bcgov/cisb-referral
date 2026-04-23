import type { RenderedEmail } from './automatic-reply';
import {
  ReferralSummaryRow,
  formatReferralSummary,
  renderReferralSummaryHtmlTable,
  renderReferralSummaryTextLines,
} from './referral-summary-table';

export type UrgentNotificationParams = ReferralSummaryRow;

export function renderUrgentNotification(
  params: UrgentNotificationParams,
): RenderedEmail {
  const s = formatReferralSummary(params);

  const subject = `URGENT Referral (${s.when}) (${s.referralId})`;

  const text = [
    'Hello,',
    '',
    'Your team has received the following urgent referral:',
    '',
    ...renderReferralSummaryTextLines(s),
    '',
    'Please attend to accordingly.',
  ].join('\n');

  const html = `
    <p>Hello,</p>
    <p>Your team has received the following urgent referral:</p>
    ${renderReferralSummaryHtmlTable(s)}
    <p>Please attend to accordingly.</p>
  `.trim();

  return { subject, text, html };
}
