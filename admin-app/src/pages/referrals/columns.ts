import {
  outcomeLabels,
  referredByLabels,
  releaseFromLabels,
  statusLabels,
  supportLabels,
  yesNoUnknownLabels,
} from "../../constants";
import { formatDate, formatDateTime, formatHours } from "../../utils";
import type { Referral } from "../../types";

export interface ReferralColumn {
  key: string;
  label: string;
  width: string;
  render: (referral: Referral) => string;
}

const text = (value: string | null | undefined): string =>
  value && value.trim() !== "" ? value : "—";

const labelOf = (
  map: Record<string, string>,
  value: string | null | undefined,
): string => (value ? map[value] || value : "—");

const supportsOf = (values: string[] | null | undefined): string => {
  if (!values || values.length === 0) return "—";
  return values.map((v) => supportLabels[v] || v).join(", ");
};

export const REFERRAL_COLUMNS: ReferralColumn[] = [
  {
    key: "flag",
    label: "Urgent",
    width: "w-[70px]",
    render: (r) => (r.flag ? "Yes" : "No"),
  },
  {
    key: "createdAt",
    label: "Created On",
    width: "w-[150px]",
    render: (r) => formatDateTime(r.createdAt),
  },
  {
    key: "updatedAt",
    label: "Updated On",
    width: "w-[150px]",
    render: (r) => formatDateTime(r.updatedAt),
  },
  {
    key: "referralStatus",
    label: "Referral Status",
    width: "w-[120px]",
    render: (r) => labelOf(statusLabels, r.referralStatus),
  },
  {
    key: "referralOutcome",
    label: "Referral Outcome",
    width: "w-[180px]",
    render: (r) => labelOf(outcomeLabels, r.referralOutcome),
  },
  {
    key: "referredBy",
    label: "Referred By",
    width: "w-[140px]",
    render: (r) => labelOf(referredByLabels, r.referredBy),
  },
  {
    key: "ministry",
    label: "Ministry",
    width: "w-[160px]",
    render: (r) => text(r.ministry?.name),
  },
  {
    key: "ministryNameOther",
    label: "Ministry (Other)",
    width: "w-[160px]",
    render: (r) => text(r.ministryNameOther),
  },
  {
    key: "agencyType",
    label: "Agency Type",
    width: "w-[160px]",
    render: (r) => text(r.agencyType?.name),
  },
  {
    key: "agencyTypeOther",
    label: "Agency Type (Other)",
    width: "w-[160px]",
    render: (r) => text(r.agencyTypeOther),
  },
  {
    key: "partnerAgencyName",
    label: "Partner Agency",
    width: "w-[180px]",
    render: (r) => text(r.partnerAgencyName),
  },
  {
    key: "programArea",
    label: "Program Area",
    width: "w-[160px]",
    render: (r) => text(r.programArea),
  },
  {
    key: "referrerContactName",
    label: "Referrer Contact Name",
    width: "w-[180px]",
    render: (r) => text(r.referrerContactName),
  },
  {
    key: "referrerEmail",
    label: "Referrer Email",
    width: "w-[200px]",
    render: (r) => text(r.referrerEmail),
  },
  {
    key: "referrerPhone",
    label: "Referrer Phone",
    width: "w-[140px]",
    render: (r) => text(r.referrerPhone),
  },
  {
    key: "individualFirstName",
    label: "First Name",
    width: "w-[120px]",
    render: (r) => text(r.individualFirstName),
  },
  {
    key: "individualMiddleName",
    label: "Middle Name",
    width: "w-[120px]",
    render: (r) => text(r.individualMiddleName),
  },
  {
    key: "individualLastName",
    label: "Last Name",
    width: "w-[120px]",
    render: (r) => text(r.individualLastName),
  },
  {
    key: "individualPreferredName",
    label: "Preferred Name",
    width: "w-[140px]",
    render: (r) => text(r.individualPreferredName),
  },
  {
    key: "individualDateOfBirth",
    label: "Date of Birth",
    width: "w-[130px]",
    render: (r) => formatDate(r.individualDateOfBirth),
  },
  {
    key: "individualPhone",
    label: "Individual Phone",
    width: "w-[140px]",
    render: (r) => text(r.individualPhone),
  },
  {
    key: "personId",
    label: "Person ID",
    width: "w-[120px]",
    render: (r) => text(r.personId),
  },
  {
    key: "secondaryContact",
    label: "Secondary Contact",
    width: "w-[180px]",
    render: (r) => text(r.secondaryContact),
  },
  {
    key: "bestWayToReach",
    label: "Best Way to Reach",
    width: "w-[160px]",
    render: (r) => text(r.bestWayToReach),
  },
  {
    key: "region",
    label: "Current Region",
    width: "w-[150px]",
    render: (r) => text(r.region?.name),
  },
  {
    key: "specificCityTown",
    label: "City/Town",
    width: "w-[140px]",
    render: (r) => text(r.specificCityTown),
  },
  {
    key: "experiencingHomelessness",
    label: "Experiencing Homelessness",
    width: "w-[150px]",
    render: (r) => labelOf(yesNoUnknownLabels, r.experiencingHomelessness),
  },
  {
    key: "losingHouse",
    label: "Losing House",
    width: "w-[140px]",
    render: (r) => labelOf(yesNoUnknownLabels, r.losingHouse),
  },
  {
    key: "pendingOrRecentlyReleased",
    label: "Pending or Recently Released",
    width: "w-[200px]",
    render: (r) => labelOf(releaseFromLabels, r.pendingOrRecentlyReleased),
  },
  {
    key: "releaseDate",
    label: "Release Date",
    width: "w-[130px]",
    render: (r) => formatDate(r.releaseDate),
  },
  {
    key: "currentlyConnectedSupports",
    label: "Currently Connected Supports",
    width: "w-[260px]",
    render: (r) => supportsOf(r.currentlyConnectedSupports),
  },
  {
    key: "currentlyConnectedSupportsOther",
    label: "Currently Connected Supports (Other)",
    width: "w-[240px]",
    render: (r) => text(r.currentlyConnectedSupportsOther),
  },
  {
    key: "neededSupports",
    label: "Needed Supports",
    width: "w-[260px]",
    render: (r) => supportsOf(r.neededSupports),
  },
  {
    key: "neededSupportsOther",
    label: "Needed Supports (Other)",
    width: "w-[220px]",
    render: (r) => text(r.neededSupportsOther),
  },
  {
    key: "referralReason",
    label: "Referral Reason",
    width: "w-[300px]",
    render: (r) => text(r.referralReason),
  },
  {
    key: "communityPartnerName",
    label: "Community Partner",
    width: "w-[180px]",
    render: (r) => text(r.communityPartnerName),
  },
  {
    key: "assignedTo",
    label: "Team Member",
    width: "w-[160px]",
    render: (r) => text(r.assignedTo?.fullName),
  },
  {
    key: "assignedOn",
    label: "Assigned On",
    width: "w-[130px]",
    render: (r) => formatDate(r.assignedOn),
  },
  {
    key: "firstContactMadeOn",
    label: "First Contact Made On",
    width: "w-[170px]",
    render: (r) => formatDate(r.firstContactMadeOn),
  },
  {
    key: "lottTriage",
    label: "LOTT (Triage)",
    width: "w-[130px]",
    render: (r) => formatHours(r.lottTriage),
  },
  {
    key: "lottContact",
    label: "LOTT (Contact)",
    width: "w-[130px]",
    render: (r) => formatHours(r.lottContact),
  },
  {
    key: "followUpDate",
    label: "Follow-Up Date",
    width: "w-[140px]",
    render: (r) => formatDate(r.followUpDate),
  },
  {
    key: "dueDate",
    label: "Due Date",
    width: "w-[120px]",
    render: (r) => formatDate(r.dueDate),
  },
  {
    key: "completedDate",
    label: "Completed Date",
    width: "w-[140px]",
    render: (r) => formatDate(r.completedDate),
  },
];

export const REFERRAL_COLUMNS_BY_KEY: Record<string, ReferralColumn> =
  Object.fromEntries(REFERRAL_COLUMNS.map((c) => [c.key, c]));

export const DEFAULT_REFERRAL_COLUMNS: string[] = [
  "flag",
  "createdAt",
  "referrerContactName",
  "referredBy",
  "referralStatus",
  "referralOutcome",
  "individualFirstName",
  "individualLastName",
  "region",
  "specificCityTown",
  "assignedTo",
];

/** Resolve a saved key list into the columns we know about (drops unknown keys). */
export function resolveColumns(keys: string[] | undefined): ReferralColumn[] {
  if (!keys || keys.length === 0) {
    return DEFAULT_REFERRAL_COLUMNS.map((k) => REFERRAL_COLUMNS_BY_KEY[k]);
  }
  const resolved = keys
    .map((k) => REFERRAL_COLUMNS_BY_KEY[k])
    .filter((c): c is ReferralColumn => Boolean(c));
  if (resolved.length === 0) {
    return DEFAULT_REFERRAL_COLUMNS.map((k) => REFERRAL_COLUMNS_BY_KEY[k]);
  }
  return resolved;
}
