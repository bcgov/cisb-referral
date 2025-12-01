import { z } from "zod";

// Enum types for dropdowns - matches exact production form
export const ReferredByType = z.enum([
  "Partner Ministry",
  "SDPR Internal",
  "Partner Agency",
]);

export const MinistryName = z.enum([
  "Ministry of Social Development & Poverty Reduction",
  "Ministry of Children and Family Development",
  "Ministry of Citizens' Services",
  "Ministry of Forests, Lands and Natural Resources",
  "Ministry of Health",
  "Ministry of Housing",
  "Ministry of Mental Health and Addictions",
  "Ministry of Transportation and Infrastructure",
  "Ministry of Emergency Management and Climate Readiness",
  "Ministry of Attorney General",
  "Other",
]);

export const AgencyType = z.enum([
  "Advocate",
  "BC Housing",
  "Community Living BC",
  "Food Security",
  "Housing",
  "Health Authority",
  "Legal Services",
  "Immigration Services",
  "Youth Services",
  "Indigenous Services",
  "Other",
]);

export const RegionType = z.enum([
  "Fraser North: Tri Cities, New Westminster, Burnaby",
  "Fraser Central/Surrey: Surrey, White Rock, North Delta",
  "Fraser South: Abbotsford, Chilliwack, Hope",
  "Vancouver DTES/Downtown",
  "Vancouver Island Central & North (North of Malahat)",
  "Interior North: Vernon, Kamloops, 100 Mile",
  "Interior South & Kootenays: Kelowna, Nakusp, Cranbrook",
  "Vancouver North & West: West End, North Shore, Whistler",
  "Northern BC (North of Williams Lake)",
  "Vancouver East/South & Richmond; South Delta, Ladner, Tsawwassen",
  "Vancouver Island South & Gulf Islands",
  "Sunshine Coast & Bowen Island",
]);

export const YesNoUnknown = z.enum(["Yes", "No", "Unknown"]);

export const ReleaseFromType = z.enum([
  "No",
  "Hospital/Medical Facility",
  "Corrections",
  "Youth Transition from MCFD",
  "Youth Transition from Delegated Aboriginal Agency",
  "Alcohol and Drug Facility",
]);

export const SupportType = z.enum([
  "Cultural",
  "Community Supports",
  "Food Security",
  "Housing",
  "Income Assistance - Provincial",
  "Income Assistance - Federal",
  "Mental Health",
  "System Navigation",
  "Health Services",
  "Substance Use",
  "Indigenous Supports",
  "Integrated Justice Supports",
  "Others",
]);

// Base schema for all fields
const baseSchema = z.object({
  // Section 1: Referrer Information
  referredBy: ReferredByType,

  // Conditional fields for Partner Ministry
  ministryName: MinistryName.optional(),
  ministryNameOther: z.string().optional(),
  programArea: z.string().optional(),

  // Conditional fields for Partner Agency
  partnerAgencyName: z.string().optional(),
  agencyType: AgencyType.optional(),
  agencyTypeOther: z.string().optional(),

  // SDPR Internal
  personId: z.string().optional(),

  // Common referrer fields
  referrerContactName: z.string().min(1, "Contact name is required"),
  referrerEmail: z.email({ message: "Please enter a valid email" }),
  referrerPhone: z.string().min(10, "Please enter a valid phone number"),

  // Section 2: Individual Information
  individualFirstName: z.string().min(1, "First name is required"),
  individualMiddleName: z.string().optional(),
  individualLastName: z.string().optional(),
  individualPreferredName: z.string().optional(),
  gainFile: z.string().optional(),
  individualPhone: z.string().optional(),
  individualDateOfBirth: z.string().optional(),
  currentRegion: RegionType,
  specificCityTown: z.string().min(1, "Current city is required"),
  secondaryContact: z.string().max(100).optional(),
  bestWayToReach: z.string().max(500).optional(),

  // Section 3: Housing Status & Critical Transitions
  currentlyHomeless: YesNoUnknown,
  pendingRelease: ReleaseFromType,

  // Section 4: Support Services
  currentlyConnectedSupports: z.array(SupportType).default([]),
  currentlyConnectedSupportsOther: z.string().optional(),
  neededSupports: z.array(SupportType).default([]),
  neededSupportsOther: z.string().optional(),
  referralSummary: z.string().max(5000).optional(),
});

// Refined schema with conditional validation
export const referralSchema = baseSchema.superRefine((data, ctx) => {
  // Partner Ministry validations
  if (data.referredBy === "Partner Ministry") {
    if (!data.ministryName) {
      ctx.addIssue({
        code: "custom",
        message: "Ministry name is required when referred by Partner Ministry",
        path: ["ministryName"],
      });
    }
    if (data.ministryName === "Other" && !data.ministryNameOther) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify the ministry name",
        path: ["ministryNameOther"],
      });
    }
  }

  // Partner Agency validations
  if (data.referredBy === "Partner Agency") {
    if (!data.partnerAgencyName) {
      ctx.addIssue({
        code: "custom",
        message:
          "Partner agency name is required when referred by Partner Agency",
        path: ["partnerAgencyName"],
      });
    }
    if (data.agencyType === "Other" && !data.agencyTypeOther) {
      ctx.addIssue({
        code: "custom",
        message: "Please specify the agency type",
        path: ["agencyTypeOther"],
      });
    }
  }

  // Support "Others" validations
  if (
    data.currentlyConnectedSupports.includes("Others") &&
    !data.currentlyConnectedSupportsOther
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Please specify other supports",
      path: ["currentlyConnectedSupportsOther"],
    });
  }

  if (data.neededSupports.includes("Others") && !data.neededSupportsOther) {
    ctx.addIssue({
      code: "custom",
      message: "Please specify other supports needed",
      path: ["neededSupportsOther"],
    });
  }
});

/**
 * Determines if the referral should be flagged as urgent
 * Based on homelessness status or pending release from facility
 */
export function isUrgentReferral(data: ReferralFormData): boolean {
  return data.currentlyHomeless === "Yes" || data.pendingRelease !== "No";
}

export type ReferralFormData = z.infer<typeof referralSchema>;
