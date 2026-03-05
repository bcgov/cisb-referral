/*
  Warnings:

  - You are about to drop the `referral_status_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE');

-- DropForeignKey
ALTER TABLE "referral_status_history" DROP CONSTRAINT "referral_status_history_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "referral_status_history" DROP CONSTRAINT "referral_status_history_referralId_fkey";

-- DropTable
DROP TABLE "referral_status_history";

-- CreateTable
CREATE TABLE "referral_audit_log" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "fieldChanged" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "comment" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "referral_audit_log_referralId_changedAt_idx" ON "referral_audit_log"("referralId", "changedAt");

-- AddForeignKey
ALTER TABLE "referral_audit_log" ADD CONSTRAINT "referral_audit_log_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_audit_log" ADD CONSTRAINT "referral_audit_log_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
