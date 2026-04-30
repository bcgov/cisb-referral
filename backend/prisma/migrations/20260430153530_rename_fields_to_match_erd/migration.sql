-- Rename columns to match ERD
ALTER TABLE "referrals" RENAME COLUMN "currentlyHomeless" TO "experiencingHomelessness";
ALTER TABLE "referrals" RENAME COLUMN "losingHousing" TO "losingHouse";
ALTER TABLE "referrals" RENAME COLUMN "pendingRelease" TO "pendingOrRecentlyReleased";
ALTER TABLE "referrals" RENAME COLUMN "referralSummary" TO "referralReason";

-- Rename index to match new column name
DROP INDEX "referrals_currentlyHomeless_idx";
CREATE INDEX "referrals_experiencingHomelessness_idx" ON "referrals"("experiencingHomelessness");
