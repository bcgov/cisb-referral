/*
  Warnings:

  - You are about to drop the column `assistantSupervisorUserId` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `managerUserId` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `supervisorUserId` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `teamMemberEmail` on the `regions` table. All the data in the column will be lost.
  - You are about to drop the column `teamMemberUserId` on the `regions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "regions" DROP CONSTRAINT "regions_assistantSupervisorUserId_fkey";

-- DropForeignKey
ALTER TABLE "regions" DROP CONSTRAINT "regions_managerUserId_fkey";

-- DropForeignKey
ALTER TABLE "regions" DROP CONSTRAINT "regions_supervisorUserId_fkey";

-- DropForeignKey
ALTER TABLE "regions" DROP CONSTRAINT "regions_teamMemberUserId_fkey";

-- AlterTable
ALTER TABLE "referrals" ALTER COLUMN "individualLastName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "regions" DROP COLUMN "assistantSupervisorUserId",
DROP COLUMN "createdBy",
DROP COLUMN "managerUserId",
DROP COLUMN "supervisorUserId",
DROP COLUMN "teamMemberEmail",
DROP COLUMN "teamMemberUserId";
