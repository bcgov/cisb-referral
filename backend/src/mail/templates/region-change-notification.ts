import type { RenderedEmail } from './automatic-reply';
import {
  ReferralSummaryRow,
  formatReferralSummary,
  renderReferralSummaryHtmlTable,
  renderReferralSummaryTextLines,
} from './referral-summary-table';

export type RegionChangeNotificationParams = ReferralSummaryRow;

export function renderRegionChangeNotification(
  params: RegionChangeNotificationParams,
): RenderedEmail {
  const s = formatReferralSummary(params);

  const subject = `Referral Re-Assignment (${s.when}) (${s.referralId})`;

  const text = [
    'Hello,',
    '',
    'The following referral has been re-assigned to your region:',
    '',
    ...renderReferralSummaryTextLines(s),
    '',
    'Please attend to accordingly.',
  ].join('\n');

  const html = `
    <p>Hello,</p>
    <p>The following referral has been re-assigned to your region:</p>
    ${renderReferralSummaryHtmlTable(s)}
    <p>Please attend to accordingly.</p>
  `.trim();

  return { subject, text, html };
}
