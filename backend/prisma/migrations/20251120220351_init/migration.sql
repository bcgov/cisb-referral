-- CreateEnum
CREATE TYPE "ReferredByType" AS ENUM ('PARTNER_MINISTRY', 'SDPR_INTERNAL', 'PARTNER_AGENCY');

-- CreateEnum
CREATE TYPE "YesNoUnknown" AS ENUM ('YES', 'NO', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ReleaseFromType" AS ENUM ('NO', 'HOSPITAL_MEDICAL_FACILITY', 'CORRECTIONS', 'YOUTH_TRANSITION_MCFD', 'YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY', 'ALCOHOL_DRUG_FACILITY');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('CULTURAL', 'COMMUNITY_SUPPORTS', 'FOOD_SECURITY', 'HOUSING', 'INCOME_ASSISTANCE_PROVINCIAL', 'INCOME_ASSISTANCE_FEDERAL', 'MENTAL_HEALTH', 'SYSTEM_NAVIGATION', 'HEALTH_SERVICES', 'SUBSTANCE_USE', 'INDIGENOUS_SUPPORTS', 'INTEGRATED_JUSTICE_SUPPORTS', 'OTHERS');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MANAGER', 'ASSISTANT_MANAGER', 'SUPERVISOR', 'ADMIN', 'SYSTEM_ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('OPEN', 'ASSIGNED', 'CONTACT_MADE', 'CLOSED');

-- CreateEnum
CREATE TYPE "ReferralOutcome" AS ENUM ('BCEA_APPLICATION_SUBMITTED', 'BCEA_APPLICATION_COMPLETED_FILE_OPENED', 'SUPPLEMENTS_ISSUED', 'CASE_MANAGED', 'SERVICES_PROVIDED', 'NOT_LOCATED', 'LOCATED_REFUSED_SERVICE', 'NON_APPROPRIATE_REFERRAL_RETURNED', 'REFERRED_TO_VS_CS', 'REFERRED_TO_COMMUNITY_PARTNER');

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerUserId" TEXT,
    "managerEmail" TEXT,
    "supervisorUserId" TEXT,
    "supervisorEmail" TEXT,
    "assistantSupervisorUserId" TEXT,
    "assistantSupervisorEmail" TEXT,
    "teamMemberUserId" TEXT,
    "teamMemberEmail" TEXT,
    "sharedMailboxEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ministries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "ministries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "agency_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT,
    "contact" TEXT,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "keycloakId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "keycloakId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referredBy" "ReferredByType" NOT NULL,
    "ministryId" TEXT,
    "ministryNameOther" TEXT,
    "programArea" TEXT,
    "partnerAgencyName" TEXT,
    "agencyTypeId" TEXT,
    "agencyTypeOther" TEXT,
    "personId" TEXT,
    "referrerContactName" TEXT NOT NULL,
    "referrerEmail" TEXT NOT NULL,
    "referrerPhone" TEXT NOT NULL,
    "individualFirstName" TEXT NOT NULL,
    "individualMiddleName" TEXT,
    "individualLastName" TEXT NOT NULL,
    "individualPreferredName" TEXT,
    "gainFile" TEXT,
    "individualDateOfBirth" DATE,
    "individualPhone" TEXT,
    "regionId" TEXT NOT NULL,
    "specificCityTown" TEXT NOT NULL,
    "bestWayToReach" TEXT,
    "secondaryContact" TEXT,
    "currentlyHomeless" "YesNoUnknown" NOT NULL,
    "losingHousing" "YesNoUnknown",
    "pendingRelease" "ReleaseFromType",
    "releaseDate" DATE,
    "flag" BOOLEAN NOT NULL DEFAULT false,
    "currentlyConnectedSupports" "SupportType"[],
    "currentlyConnectedSupportsOther" TEXT,
    "neededSupports" "SupportType"[],
    "neededSupportsOther" TEXT,
    "referralSummary" TEXT,
    "referralOutcome" "ReferralOutcome",
    "communityPartnerName" TEXT,
    "referralStatus" "ReferralStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "followUpDate" DATE,
    "dueDate" DATE,
    "completedDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT,
    "createdBy" TEXT,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_status_history" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "fromStatus" "ReferralStatus",
    "toStatus" "ReferralStatus" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "referral_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ministries_name_key" ON "ministries"("name");

-- CreateIndex
CREATE INDEX "ministries_isActive_idx" ON "ministries"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "agency_types_name_key" ON "agency_types"("name");

-- CreateIndex
CREATE INDEX "agency_types_isActive_idx" ON "agency_types"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_keycloakId_key" ON "users"("keycloakId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_userName_key" ON "contacts"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_email_key" ON "contacts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_keycloakId_key" ON "contacts"("keycloakId");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_userName_idx" ON "contacts"("userName");

-- CreateIndex
CREATE INDEX "contacts_isActive_idx" ON "contacts"("isActive");

-- CreateIndex
CREATE INDEX "referrals_referredBy_idx" ON "referrals"("referredBy");

-- CreateIndex
CREATE INDEX "referrals_regionId_idx" ON "referrals"("regionId");

-- CreateIndex
CREATE INDEX "referrals_ministryId_idx" ON "referrals"("ministryId");

-- CreateIndex
CREATE INDEX "referrals_agencyTypeId_idx" ON "referrals"("agencyTypeId");

-- CreateIndex
CREATE INDEX "referrals_currentlyHomeless_idx" ON "referrals"("currentlyHomeless");

-- CreateIndex
CREATE INDEX "referrals_referralStatus_idx" ON "referrals"("referralStatus");

-- CreateIndex
CREATE INDEX "referrals_assignedToId_idx" ON "referrals"("assignedToId");

-- CreateIndex
CREATE INDEX "referrals_createdAt_idx" ON "referrals"("createdAt");

-- CreateIndex
CREATE INDEX "referrals_flag_idx" ON "referrals"("flag");

-- CreateIndex
CREATE INDEX "referral_status_history_referralId_idx" ON "referral_status_history"("referralId");

-- CreateIndex
CREATE INDEX "referral_status_history_createdAt_idx" ON "referral_status_history"("createdAt");

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_managerUserId_fkey" FOREIGN KEY ("managerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_supervisorUserId_fkey" FOREIGN KEY ("supervisorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_assistantSupervisorUserId_fkey" FOREIGN KEY ("assistantSupervisorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_teamMemberUserId_fkey" FOREIGN KEY ("teamMemberUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "ministries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_agencyTypeId_fkey" FOREIGN KEY ("agencyTypeId") REFERENCES "agency_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_status_history" ADD CONSTRAINT "referral_status_history_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_status_history" ADD CONSTRAINT "referral_status_history_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
