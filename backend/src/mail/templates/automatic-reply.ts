import { Referral } from '../../generated/prisma/client';

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

export function renderAutomaticReply(referral: Referral): RenderedEmail {
  const greetingName = referral.referrerContactName?.trim() || 'there';

  const subject = "We've received your referral";

  const text = [
    `Hello ${greetingName},`,
    '',
    '',
    'Thank you for your referral to the Community Integration Services Branch (CISB) at the Ministry of Social Development and Poverty Reduction. This email confirms your request was successfully submitted to our system.',
    '',
    'You may be contacted by a team member if more information is required, or if the referral does not meet CISB Guidelines.',
    '',
    'Thank you again,',
    'Community Integration Services Branch',
    'Ministry of Social Development and Poverty Reduction',
  ].join('\n');

  const html = `
    <p>Hello ${escapeHtml(greetingName)},</p>
    <p>Thank you for your referral to the Community Integration Services Branch (CISB) at the Ministry of Social Development and Poverty Reduction. This email confirms your request was successfully submitted to our system.</p>
    <p>You may be contacted by a team member if more information is required, or if the referral does not meet CISB Guidelines.</p>
    <p>
      Thank you again,<br/>
      Community Integration Services Branch<br/>
      Ministry of Social Development and Poverty Reduction
    </p>
  `.trim();

  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
