import { escapeHtml } from './escape-html';
import type { RenderedEmail } from './automatic-reply';

export interface AssignmentNotificationParams {
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
const HEAD_CELL = `${CELL} text-align: left; background: #f4f4f4;`;

export function renderAssignmentNotification(
  params: AssignmentNotificationParams,
): RenderedEmail {
  const statusLabel = STATUS_LABELS[params.status] ?? params.status;
  const urgent = params.flagged ? 'Yes' : 'No';
  const when = formatVancouverDateTime(params.createdAt);
  const cityTown = params.cityTown?.trim() || 'Unknown';

  const subject = `Referral Assignment (${when}) (${params.referralId})`;

  const text = [
    'Hello,',
    '',
    'You have been assigned the following referral:',
    '',
    `ID Number: ${params.referralId}`,
    `City/Town: ${cityTown}`,
    `Date/Time: ${when}`,
    `Status: ${statusLabel}`,
    `Flagged Urgent: ${urgent}`,
    '',
    `View referral: ${params.referralUrl}`,
    '',
    'Please attend to accordingly.',
  ].join('\n');

  const html = `
    <p>Hello,</p>
    <p>You have been assigned the following referral:</p>
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
          <td style="${CELL}"><a href="${escapeHtml(params.referralUrl)}">${escapeHtml(params.referralId)}</a></td>
          <td style="${CELL}">${escapeHtml(cityTown)}</td>
          <td style="${CELL}">${escapeHtml(when)}</td>
          <td style="${CELL}">${escapeHtml(statusLabel)}</td>
          <td style="${CELL}">${urgent}</td>
        </tr>
      </tbody>
    </table>
    <p>
      Please attend to accordingly.
    </p>
  `.trim();

  return { subject, text, html };
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
