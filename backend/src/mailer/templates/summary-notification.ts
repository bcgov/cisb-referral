import type { RenderedEmail } from './automatic-reply';
import {
  ReferralSummaryRow,
  formatReferralSummary,
  renderReferralSummaryHtmlTable,
  renderReferralSummaryTextLines,
} from './referral-summary-table';
import { escapeHtml } from '../utils/escape-html';

export interface SummaryNotificationRow
  extends Omit<ReferralSummaryRow, 'referralUrl'> {}

export interface SummaryNotificationParams {
  regionName: string;
  windowStart: Date;
  windowEnd: Date;
  referralUrlBase: string;
  rows: SummaryNotificationRow[];
}

function formatUtcTimestamp(value: Date): string {
  return value.toISOString().replace('.000Z', 'Z');
}

function buildSummaryRow(
  row: SummaryNotificationRow,
  referralUrlBase: string,
): ReturnType<typeof formatReferralSummary> {
  return formatReferralSummary({
    ...row,
    referralUrl: `${referralUrlBase}/${row.referralId}`,
  });
}

export function renderSummaryNotification(
  params: SummaryNotificationParams,
): RenderedEmail {
  const windowLabel = `${formatUtcTimestamp(params.windowStart)} to ${formatUtcTimestamp(params.windowEnd)}`;
  const formattedRows = params.rows.map((row) =>
    buildSummaryRow(row, params.referralUrlBase),
  );

  const subject = `Referral summary: ${params.regionName} (${formattedRows.length})`;

  const text = [
    'Hello,',
    '',
    `Referral summary for region: ${params.regionName}`,
    `Window (UTC): ${windowLabel}`,
    `Total referrals: ${formattedRows.length}`,
    '',
    ...formattedRows.flatMap((row, index) => [
      `Referral ${index + 1}`,
      ...renderReferralSummaryTextLines(row),
      '',
    ]),
  ].join('\n');

  const html = `
    <p>Hello,</p>
    <p>Referral summary for region: <strong>${escapeHtml(params.regionName)}</strong></p>
    <p>Window (UTC): ${escapeHtml(windowLabel)}<br/>Total referrals: ${formattedRows.length}</p>
    ${formattedRows
      .map(
        (row, index) => `
          <h3>Referral ${index + 1}</h3>
          ${renderReferralSummaryHtmlTable(row)}
        `,
      )
      .join('')}
  `.trim();

  return { subject, text, html };
}
