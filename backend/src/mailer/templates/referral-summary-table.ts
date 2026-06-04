import { escapeHtml } from '../utils/escape-html';

export interface ReferralSummaryRow {
  referralId: string;
  referralUrl: string;
  cityTown: string;
  createdAt: Date;
  status: string;
  flagged: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned',
  CONTACT_MADE: 'Contact Made',
  CLOSED: 'Closed',
};

const CELL = 'border: 1px solid #ccc; padding: 6px 10px;';
const HEAD_CELL = `${CELL} text-align: left; background: #5595D9; color: #ffffff;`;

export interface FormattedReferralSummary {
  referralId: string;
  referralUrl: string;
  cityTown: string;
  when: string;
  statusLabel: string;
  urgent: 'Yes' | 'No';
}

export function formatReferralSummary(
  row: ReferralSummaryRow,
): FormattedReferralSummary {
  return {
    referralId: row.referralId,
    referralUrl: row.referralUrl,
    cityTown: row.cityTown?.trim() || 'Unknown',
    when: formatVancouverDateTime(row.createdAt),
    statusLabel: STATUS_LABELS[row.status] ?? row.status,
    urgent: row.flagged ? 'Yes' : 'No',
  };
}

export function renderReferralSummaryTextLines(
  s: FormattedReferralSummary,
): string[] {
  return [
    `ID Number: ${s.referralId}`,
    `City/Town: ${s.cityTown}`,
    `Date/Time: ${s.when}`,
    `Status: ${s.statusLabel}`,
    `Flagged Urgent: ${s.urgent}`,
    '',
    `View referral: ${s.referralUrl}`,
  ];
}

export function renderReferralSummaryHtmlTable(
  s: FormattedReferralSummary,
): string {
  return `
    <table style="border-collapse: collapse; margin: 8px 0;">
      <thead>
        <tr>
          <th style="${HEAD_CELL}">ID Number</th>
          <th style="${HEAD_CELL}">City/Town</th>
          <th style="${HEAD_CELL}">Date/Time</th>
          <th style="${HEAD_CELL}">Status</th>
          <th style="${HEAD_CELL}">Flagged Urgent</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="${CELL}"><a href="${escapeHtml(s.referralUrl)}">${escapeHtml(s.referralId)}</a></td>
          <td style="${CELL}">${escapeHtml(s.cityTown)}</td>
          <td style="${CELL}">${escapeHtml(s.when)}</td>
          <td style="${CELL}">${escapeHtml(s.statusLabel)}</td>
          <td style="${CELL}">${s.urgent}</td>
        </tr>
      </tbody>
    </table>
  `.trim();
}

function formatVancouverDateTime(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}
