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
  "Fraser South: Delta, Surrey, White Rock",
  "Fraser North: Tri Cities, Mission, Burnaby",
  "Fraser Valley: Maple Ridge, Hope",
  "Northern BC (North of Williams Lake)",
  "Central & North Vancouver Island (North of Malahat)",
  "South Vancouver Island & Salt Spring Island",
  "Central & Northern Interior: Vernon, Kamloops, 100 Mile",
  "Southern Interior & Kootenays: Kelowna, Nakusp, Cranbrook",
  "North & West Vancouver: Downtown Vancouver, Whistler",
  "Sunshine Coast & Bowen Island",
  "South Vancouver & Richmond",
  "Vancouver DTES",
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
  referrerEmail: z.string().email("Please enter a valid email"),
  referrerPhone: z.string().min(10, "Please enter a valid phone number"),

  // Section 2: Individual Information
  individualFirstName: z.string().min(1, "First name is required"),
  individualMiddleName: z.string().optional(),
  individualLastName: z.string().optional(), // Optional in production form
  individualPreferredName: z.string().optional(),
  gainFile: z.string().optional(), // GAIN File (SA) field
  individualPhone: z.string().optional(),
  individualDateOfBirth: z.string().optional(), // Will be date string from input
  currentRegion: RegionType,
  specificCityTown: z.string().min(1, "Current city is required"),
  secondaryContact: z.string().optional(),
  bestWayToReach: z.string().optional(),

  // Section 3: Housing Status & Critical Transitions
  currentlyHomeless: YesNoUnknown,
  pendingRelease: ReleaseFromType,

  // Section 4: Support Services
  currentlyConnectedSupports: z.array(SupportType).default([]),
  currentlyConnectedSupportsOther: z.string().optional(),
  neededSupports: z.array(SupportType).default([]),
  neededSupportsOther: z.string().optional(),
  referralSummary: z
    .string()
    .max(5000, "Summary must be less than 1000 words (approx 5000 characters)")
    .optional(),
});

// Refined schema with conditional validation
export const referralSchema = baseSchema.superRefine((data, ctx) => {
  // Partner Ministry validations
  if (data.referredBy === "Partner Ministry") {
    if (!data.ministryName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ministry name is required when referred by Partner Ministry",
        path: ["ministryName"],
      });
    }
    if (data.ministryName === "Other" && !data.ministryNameOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the ministry name",
        path: ["ministryNameOther"],
      });
    }
  }

  // Partner Agency validations
  if (data.referredBy === "Partner Agency") {
    if (!data.partnerAgencyName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Partner agency name is required when referred by Partner Agency",
        path: ["partnerAgencyName"],
      });
    }
    if (data.agencyType === "Other" && !data.agencyTypeOther) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the agency type",
        path: ["agencyTypeOther"],
      });
    }
  }

  // Support "Others" validations
  if (
    data.currentlyConnectedSupports.includes("Others" as any) &&
    !data.currentlyConnectedSupportsOther
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify other supports",
      path: ["currentlyConnectedSupportsOther"],
    });
  }

  if (
    data.neededSupports.includes("Others" as any) &&
    !data.neededSupportsOther
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify other supports needed",
      path: ["neededSupportsOther"],
    });
  }
});

// Helper function to determine flags
export function getReferralFlags(data: ReferralFormData): string[] {
  const flags: string[] = [];

  if (data.currentlyHomeless === "Yes") {
    flags.push("HOUSING_RISK");
  }

  if (data.pendingRelease !== "No") {
    flags.push("CRITICAL_TRANSITION");
  }

  return flags;
}

export type ReferralFormData = z.infer<typeof referralSchema>;
