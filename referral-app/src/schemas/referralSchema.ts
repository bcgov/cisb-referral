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
  atRiskOfLosingHousing: YesNoUnknown.optional(),
  pendingRelease: ReleaseFromType.optional(),
  releaseDischargeDate: z.string().optional(),

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

  // Conditional requiredness: atRiskOfLosingHousing required when homeless is "No" or "Unknown"
  if (
    (data.currentlyHomeless === "No" || data.currentlyHomeless === "Unknown") &&
    !data.atRiskOfLosingHousing
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Please indicate if they are at risk of losing housing",
      path: ["atRiskOfLosingHousing"],
    });
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
 * Business Rules:
 * 1. Experiencing Homelessness is Yes
 * 2. At Risk of Losing Housing is Yes
 * 3. Pending Release has a value AND Release/Discharge Date is within 3-4 days
 */
export function isUrgentReferral(data: ReferralFormData): boolean {
  // Rule 1: Currently experiencing homelessness
  if (data.currentlyHomeless === "Yes") {
    return true;
  }

  // Rule 2: At risk of losing housing
  if (data.atRiskOfLosingHousing === "Yes") {
    return true;
  }

  // Rule 3: Pending release with discharge date within 3-4 days
  if (data.pendingRelease && data.releaseDischargeDate) {
    const releaseDate = new Date(data.releaseDischargeDate);
    const today = new Date();
    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Within 3-4 days (0-4 days from now)
    if (diffDays >= 0 && diffDays <= 4) {
      return true;
    }
  }

  return false;
}

export type ReferralFormData = z.infer<typeof referralSchema>;
