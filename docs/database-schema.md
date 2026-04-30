# Database Schema Overview

This document provides a high-level overview of the database structure for the CISB Referral system.

## Tables Overview

| Table                     | Description                                      |
| ------------------------- | ------------------------------------------------ |
| **Region**                | BC geographic regions with staff email contacts  |
| **Ministry**              | BC government ministries that can make referrals |
| **AgencyType**            | Partner agency types that can make referrals     |
| **User**                  | Internal system users (staff)                    |
| **Contact**               | External portal users who submit referrals       |
| **Referral**              | Main referral records                            |
| **ReferralStatusHistory** | Audit trail of referral status changes           |

## Enums

| Enum                | Values                                                                                                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ReferredByType**  | `PARTNER_MINISTRY`, `SDPR_INTERNAL`, `PARTNER_AGENCY`                                                                                                                                                                                                                  |
| **YesNoUnknown**    | `YES`, `NO`, `UNKNOWN`                                                                                                                                                                                                                                                 |
| **ReleaseFromType** | `NO`, `HOSPITAL_MEDICAL_FACILITY`, `CORRECTIONS`, `YOUTH_TRANSITION_MCFD`, `YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY`, `ALCOHOL_DRUG_FACILITY`                                                                                                                     |
| **SupportType**     | `CULTURAL`, `COMMUNITY_SUPPORTS`, `FOOD_SECURITY`, `HOUSING`, `INCOME_ASSISTANCE_PROVINCIAL`, `INCOME_ASSISTANCE_FEDERAL`, `MENTAL_HEALTH`, `SYSTEM_NAVIGATION`, `HEALTH_SERVICES`, `SUBSTANCE_USE`, `INDIGENOUS_SUPPORTS`, `INTEGRATED_JUSTICE_SUPPORTS`, `OTHERS`    |
| **UserRole**        | `USER`, `ADMIN`, `SYSTEM_ADMINISTRATOR`                                                                                                                                                                                                                                |
| **ReferralStatus**  | `OPEN`, `ASSIGNED`, `CONTACT_MADE`, `CLOSED`                                                                                                                                                                                                                           |
| **ReferralOutcome** | `BCEA_APPLICATION_SUBMITTED`, `BCEA_APPLICATION_COMPLETED_FILE_OPENED`, `SUPPLEMENTS_ISSUED`, `CASE_MANAGED`, `SERVICES_PROVIDED`, `NOT_LOCATED`, `LOCATED_REFUSED_SERVICE`, `NON_APPROPRIATE_REFERRAL_RETURNED`, `REFERRED_TO_VS_CS`, `REFERRED_TO_COMMUNITY_PARTNER` |

## Entity Relationships

```
Region ──────────┐
Ministry ────────┤
AgencyType ──────┼──< Referral >──── ReferralStatusHistory
User ────────────┤
Contact ─────────┘
```

- A **Region** stores staff email contacts (manager, supervisor, assistant supervisor, shared mailbox) but does not link directly to **User** records.
- A **Referral** belongs to a **Region** and optionally to a **Ministry** or **AgencyType** depending on the referral source (`ReferredByType`).
- A **Referral** can be assigned to a **User** for case management.
- A **Referral** may be created by a **Contact** (external portal submission).
- **ReferralStatusHistory** tracks all status transitions on a referral, with optional comments and author references.

## Model Details

### Region

| Field                      | Type     | Notes        |
| -------------------------- | -------- | ------------ |
| `id`                       | UUID     | Primary key  |
| `name`                     | String   | Unique       |
| `managerEmail`             | String?  |              |
| `supervisorEmail`          | String?  |              |
| `assistantSupervisorEmail` | String?  |              |
| `sharedMailboxEmail`       | String?  |              |
| `createdAt`                | DateTime | Auto-set     |
| `updatedAt`                | DateTime | Auto-updated |

### Ministry

| Field       | Type     | Notes           |
| ----------- | -------- | --------------- |
| `id`        | UUID     | Primary key     |
| `name`      | String   | Unique          |
| `isActive`  | Boolean  | Default: `true` |
| `createdBy` | String?  |                 |
| `createdAt` | DateTime | Auto-set        |
| `updatedAt` | DateTime | Auto-updated    |

### AgencyType

| Field       | Type     | Notes           |
| ----------- | -------- | --------------- |
| `id`        | UUID     | Primary key     |
| `name`      | String   | Unique          |
| `isActive`  | Boolean  | Default: `true` |
| `createdBy` | String?  |                 |
| `createdAt` | DateTime | Auto-set        |
| `updatedAt` | DateTime | Auto-updated    |

### User

| Field         | Type      | Notes                 |
| ------------- | --------- | --------------------- |
| `id`          | UUID      | Primary key           |
| `fullName`    | String    |                       |
| `email`       | String    | Unique, indexed       |
| `address`     | String?   |                       |
| `contact`     | String?   |                       |
| `role`        | UserRole  |                       |
| `isActive`    | Boolean   | Default: `true`       |
| `deletedAt`   | DateTime? | Soft delete timestamp |
| `keycloakId`  | String?   | Unique                |
| `lastLoginAt` | DateTime? |                       |
| `createdAt`   | DateTime  | Auto-set              |
| `updatedAt`   | DateTime  | Auto-updated          |

### Contact

| Field         | Type      | Notes           |
| ------------- | --------- | --------------- |
| `id`          | UUID      | Primary key     |
| `userName`    | String    | Unique, indexed |
| `fullName`    | String    |                 |
| `companyName` | String?   |                 |
| `email`       | String    | Unique, indexed |
| `phone`       | String?   |                 |
| `isActive`    | Boolean   | Default: `true` |
| `keycloakId`  | String?   | Unique          |
| `lastLoginAt` | DateTime? |                 |
| `createdAt`   | DateTime  | Auto-set        |
| `updatedAt`   | DateTime  | Auto-updated    |

### Referral

| Field                             | Type             | Notes            |
| --------------------------------- | ---------------- | ---------------- |
| `id`                              | UUID             | Primary key      |
| `referredBy`                      | ReferredByType   |                  |
| `ministryId`                      | UUID?            | FK → Ministry    |
| `ministryNameOther`               | String?          |                  |
| `programArea`                     | String?          |                  |
| `partnerAgencyName`               | String?          |                  |
| `agencyTypeId`                    | UUID?            | FK → AgencyType  |
| `agencyTypeOther`                 | String?          |                  |
| `personId`                        | String?          |                  |
| `referrerContactName`             | String           |                  |
| `referrerEmail`                   | String           |                  |
| `referrerPhone`                   | String           |                  |
| `individualFirstName`             | String           |                  |
| `individualMiddleName`            | String?          |                  |
| `individualLastName`              | String?          |                  |
| `individualPreferredName`         | String?          |                  |
| `gainFile`                        | String?          |                  |
| `individualDateOfBirth`           | Date?            |                  |
| `individualPhone`                 | String?          |                  |
| `regionId`                        | UUID             | FK → Region      |
| `specificCityTown`                | String           |                  |
| `bestWayToReach`                  | String?          |                  |
| `secondaryContact`                | String?          |                  |
| `experiencingHomelessness`        | YesNoUnknown     |                  |
| `losingHouse`                     | YesNoUnknown?    |                  |
| `pendingOrRecentlyReleased`       | ReleaseFromType? |                  |
| `releaseDate`                     | Date?            |                  |
| `flag`                            | Boolean          | Default: `false` |
| `currentlyConnectedSupports`      | SupportType[]    |                  |
| `currentlyConnectedSupportsOther` | String?          |                  |
| `neededSupports`                  | SupportType[]    |                  |
| `neededSupportsOther`             | String?          |                  |
| `referralReason`                  | Text?            |                  |
| `referralOutcome`                 | ReferralOutcome? |                  |
| `communityPartnerName`            | String?          |                  |
| `referralStatus`                  | ReferralStatus   | Default: `OPEN`  |
| `assignedToId`                    | UUID?            | FK → User        |
| `followUpDate`                    | Date?            |                  |
| `dueDate`                         | Date?            |                  |
| `completedDate`                   | Date?            |                  |
| `modifiedBy`                      | String?          |                  |
| `createdBy`                       | String?          | FK → Contact     |
| `createdAt`                       | DateTime         | Auto-set         |
| `updatedAt`                       | DateTime         | Auto-updated     |

### ReferralStatusHistory

| Field        | Type            | Notes                          |
| ------------ | --------------- | ------------------------------ |
| `id`         | UUID            | Primary key                    |
| `referralId` | UUID            | FK → Referral (cascade delete) |
| `fromStatus` | ReferralStatus? |                                |
| `toStatus`   | ReferralStatus  |                                |
| `comment`    | Text?           |                                |
| `createdBy`  | UUID?           | FK → User                      |
| `createdAt`  | DateTime        | Auto-set                       |
