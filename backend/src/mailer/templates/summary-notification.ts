import type { RenderedEmail } from './automatic-reply';
import {
  ReferralSummaryRow,
  formatReferralSummary,
  renderReferralSummaryHtmlTable,
  renderReferralSummaryTextLines,
} from './referral-summary-table';

export interface SummaryNotificationRow
  extends Omit<ReferralSummaryRow, 'referralUrl'> {}

export interface SummaryNotificationParams {
  regionName: string;
  windowStart: Date;
  windowEnd: Date;
  referralUrlBase: string;
  rows: SummaryNotificationRow[];
}

const PERMANENT_VANCOUVER_OFFSET_MS = 7 * 60 * 60 * 1000;

function toVancouverTimestamp(value: Date): string {
  return new Date(value.getTime() - PERMANENT_VANCOUVER_OFFSET_MS)
    .toISOString()
    .slice(0, 16);
}

function toSummaryLabel(windowEnd: Date): 'AM' | 'PM' {
  const localHour = Number(toVancouverTimestamp(windowEnd).slice(11, 13));
  return localHour < 12 ? 'AM' : 'PM';
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
  const runLabel = toSummaryLabel(params.windowEnd);
  const runTimestamp = toVancouverTimestamp(params.windowEnd);
  const formattedRows = params.rows.map((row) =>
    buildSummaryRow(row, params.referralUrlBase),
  );

  const subject = `${runLabel} Referral Summary - ${runTimestamp}`;

  const text = [
    'Hello,',
    '',
    'Your team has received the following referrals:',
    '',
    ...formattedRows.flatMap((row) => [
      ...renderReferralSummaryTextLines(row),
      '',
    ]),
    'Please attend to accordingly.',
  ].join('\n');

  const html = `
    <p>Hello,</p>
    <p>Your team has received the following referrals:</p>
    ${formattedRows
      .map(
        (row) => `
          ${renderReferralSummaryHtmlTable(row)}
        `,
      )
      .join('')}
    <p>Please attend to accordingly.</p>
  `.trim();

  return { subject, text, html };
}
