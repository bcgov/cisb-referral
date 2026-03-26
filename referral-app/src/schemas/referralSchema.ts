import { z } from "zod";

// Backend enum values with display labels
// These match the Prisma schema enums exactly

export const ReferredByType = {
  PARTNER_MINISTRY: "PARTNER_MINISTRY",
  SDPR_INTERNAL: "SDPR_INTERNAL",
  PARTNER_AGENCY: "PARTNER_AGENCY",
} as const;

export const ReferredByTypeLabels: Record<string, string> = {
  PARTNER_MINISTRY: "Partner Ministry",
  SDPR_INTERNAL: "SDPR Internal",
  PARTNER_AGENCY: "Partner Agency",
};

export const ReferredByTypeOptions = Object.entries(ReferredByTypeLabels).map(
  ([id, name]) => ({ id, name }),
);

export const YesNoUnknown = {
  YES: "YES",
  NO: "NO",
  UNKNOWN: "UNKNOWN",
} as const;

export const YesNoUnknownLabels: Record<string, string> = {
  YES: "Yes",
  NO: "No",
  UNKNOWN: "Unknown",
};

export const YesNoUnknownOptions = Object.entries(YesNoUnknownLabels).map(
  ([id, name]) => ({ id, name }),
);

export const ReleaseFromType = {
  HOSPITAL_MEDICAL_FACILITY: "HOSPITAL_MEDICAL_FACILITY",
  CORRECTIONS: "CORRECTIONS",
  YOUTH_TRANSITION_MCFD: "YOUTH_TRANSITION_MCFD",
  YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY:
    "YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY",
  ALCOHOL_DRUG_FACILITY: "ALCOHOL_DRUG_FACILITY",
} as const;

export const ReleaseFromTypeLabels: Record<string, string> = {
  HOSPITAL_MEDICAL_FACILITY: "Hospital/Medical Facility",
  CORRECTIONS: "Corrections",
  YOUTH_TRANSITION_MCFD: "Youth Transition from MCFD",
  YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY:
    "Youth Transition from Delegated Aboriginal Agency",
  ALCOHOL_DRUG_FACILITY: "Alcohol and Drug Facility",
};

export const ReleaseFromTypeOptions = Object.entries(ReleaseFromTypeLabels).map(
  ([id, name]) => ({ id, name }),
);

export const SupportType = {
  CULTURAL: "CULTURAL",
  COMMUNITY_SUPPORTS: "COMMUNITY_SUPPORTS",
  FOOD_SECURITY: "FOOD_SECURITY",
  HOUSING: "HOUSING",
  INCOME_ASSISTANCE_PROVINCIAL: "INCOME_ASSISTANCE_PROVINCIAL",
  INCOME_ASSISTANCE_FEDERAL: "INCOME_ASSISTANCE_FEDERAL",
  MENTAL_HEALTH: "MENTAL_HEALTH",
  SYSTEM_NAVIGATION: "SYSTEM_NAVIGATION",
  HEALTH_SERVICES: "HEALTH_SERVICES",
  SUBSTANCE_USE: "SUBSTANCE_USE",
  INDIGENOUS_SUPPORTS: "INDIGENOUS_SUPPORTS",
  INTEGRATED_JUSTICE_SUPPORTS: "INTEGRATED_JUSTICE_SUPPORTS",
  OTHERS: "OTHERS",
} as const;

export const SupportTypeLabels: Record<string, string> = {
  CULTURAL: "Cultural",
  COMMUNITY_SUPPORTS: "Community Supports",
  FOOD_SECURITY: "Food Security",
  HOUSING: "Housing",
  INCOME_ASSISTANCE_PROVINCIAL: "Income Assistance - Provincial",
  INCOME_ASSISTANCE_FEDERAL: "Income Assistance - Federal",
  MENTAL_HEALTH: "Mental Health",
  SYSTEM_NAVIGATION: "System Navigation",
  HEALTH_SERVICES: "Health Services",
  SUBSTANCE_USE: "Substance Use",
  INDIGENOUS_SUPPORTS: "Indigenous Supports",
  INTEGRATED_JUSTICE_SUPPORTS: "Integrated Justice Supports",
  OTHERS: "Others",
};

export const SupportTypeOptions = Object.entries(SupportTypeLabels).map(
  ([id, name]) => ({ id, name }),
);

// Zod enums using backend values
const ReferredByEnum = z.enum([
  ReferredByType.PARTNER_MINISTRY,
  ReferredByType.SDPR_INTERNAL,
  ReferredByType.PARTNER_AGENCY,
]);

const YesNoUnknownEnum = z.enum([
  YesNoUnknown.YES,
  YesNoUnknown.NO,
  YesNoUnknown.UNKNOWN,
]);

const ReleaseFromEnum = z.enum([
  ReleaseFromType.HOSPITAL_MEDICAL_FACILITY,
  ReleaseFromType.CORRECTIONS,
  ReleaseFromType.YOUTH_TRANSITION_MCFD,
  ReleaseFromType.YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY,
  ReleaseFromType.ALCOHOL_DRUG_FACILITY,
]);

const SupportTypeEnum = z.enum([
  SupportType.CULTURAL,
  SupportType.COMMUNITY_SUPPORTS,
  SupportType.FOOD_SECURITY,
  SupportType.HOUSING,
  SupportType.INCOME_ASSISTANCE_PROVINCIAL,
  SupportType.INCOME_ASSISTANCE_FEDERAL,
  SupportType.MENTAL_HEALTH,
  SupportType.SYSTEM_NAVIGATION,
  SupportType.HEALTH_SERVICES,
  SupportType.SUBSTANCE_USE,
  SupportType.INDIGENOUS_SUPPORTS,
  SupportType.INTEGRATED_JUSTICE_SUPPORTS,
  SupportType.OTHERS,
]);

// Base schema for all fields
const baseSchema = z.object({
  // Section 1: Referrer Information
  referredBy: ReferredByEnum,

  // Conditional fields for Partner Ministry (now using ID reference)
  ministryId: z.uuid().optional(),
  ministryNameOther: z.string().optional(),
  programArea: z.string().optional(),

  // Conditional fields for Partner Agency
  partnerAgencyName: z.string().optional(),
  agencyTypeId: z.uuid().optional(),
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
  regionId: z.uuid({ message: "Please select a region" }),
  specificCityTown: z.string().min(1, "Current city is required"),
  secondaryContact: z.string().max(100).optional(),
  bestWayToReach: z.string().max(500).optional(),

  // Section 3: Housing Status & Critical Transitions
  currentlyHomeless: YesNoUnknownEnum,
  losingHousing: YesNoUnknownEnum.optional(),
  pendingRelease: ReleaseFromEnum.optional(),
  releaseDate: z.string().optional(),

  // Section 4: Support Services
  currentlyConnectedSupports: z.array(SupportTypeEnum),
  currentlyConnectedSupportsOther: z.string().optional(),
  neededSupports: z.array(SupportTypeEnum),
  neededSupportsOther: z.string().optional(),
  referralSummary: z.string().max(5000).optional(),
});

// Helper type for base schema data
type BaseSchemaData = z.infer<typeof baseSchema>;

// Validation helper functions to reduce cognitive complexity
function validatePartnerMinistry(
  data: BaseSchemaData,
  ctx: z.RefinementCtx,
): void {
  if (data.referredBy !== ReferredByType.PARTNER_MINISTRY) {
    return;
  }

  if (!data.ministryId) {
    ctx.addIssue({
      code: "custom",
      message: "Ministry is required when referred by Partner Ministry",
      path: ["ministryId"],
    });
  }
}

function validatePartnerAgency(
  data: BaseSchemaData,
  ctx: z.RefinementCtx,
): void {
  if (data.referredBy !== ReferredByType.PARTNER_AGENCY) {
    return;
  }

  if (!data.partnerAgencyName) {
    ctx.addIssue({
      code: "custom",
      message:
        "Partner agency name is required when referred by Partner Agency",
      path: ["partnerAgencyName"],
    });
  }
}

function validateHousingStatus(
  data: BaseSchemaData,
  ctx: z.RefinementCtx,
): void {
  const requiresLosingHousingField =
    data.currentlyHomeless === YesNoUnknown.NO ||
    data.currentlyHomeless === YesNoUnknown.UNKNOWN;

  if (requiresLosingHousingField && !data.losingHousing) {
    ctx.addIssue({
      code: "custom",
      message: "Please indicate if they are at risk of losing housing",
      path: ["losingHousing"],
    });
  }
}

function validateSupportServices(
  data: BaseSchemaData,
  ctx: z.RefinementCtx,
): void {
  if (
    data.currentlyConnectedSupports.includes(SupportType.OTHERS) &&
    !data.currentlyConnectedSupportsOther
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Please specify other supports",
      path: ["currentlyConnectedSupportsOther"],
    });
  }

  if (
    data.neededSupports.includes(SupportType.OTHERS) &&
    !data.neededSupportsOther
  ) {
    ctx.addIssue({
      code: "custom",
      message: "Please specify other supports needed",
      path: ["neededSupportsOther"],
    });
  }
}

// Refined schema with conditional validation
export const referralSchema = baseSchema.superRefine((data, ctx) => {
  validatePartnerMinistry(data, ctx);
  validatePartnerAgency(data, ctx);
  validateHousingStatus(data, ctx);
  validateSupportServices(data, ctx);
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
  if (data.currentlyHomeless === YesNoUnknown.YES) {
    return true;
  }

  // Rule 2: At risk of losing housing
  if (data.losingHousing === YesNoUnknown.YES) {
    return true;
  }

  // Rule 3: Pending release with discharge date within 3-4 days
  if (data.pendingRelease && data.releaseDate) {
    const releaseDate = new Date(data.releaseDate);
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
