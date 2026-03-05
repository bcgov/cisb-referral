# Database ERD Reference

This document describes the database structure based on the Power Platform ERD and requirements.

## Tables Overview

- **Region** - BC geographic regions with staff assignments
- **Ministry** - BC government ministries
- **AgencyType** - Partner agency types
- **User** - System users (managers, supervisors, admins)
- **Contact** - Portal users who submit referrals
- **Referral** - Main referral records
- **ReferralAuditLog** - Audit trail of all field-level changes to referrals

---

## Region Table

Geographic regions in BC where referrals are routed. Each region has assigned staff members.

| Field                     | Type     | Required | Notes                                                                   |
| ------------------------- | -------- | -------- | ----------------------------------------------------------------------- |
| id                        | UUID     | Yes      | Primary key (RegionID in Power Platform)                                |
| name                      | String   | Yes      | Region Description - editable by Manager/Supervisor/AssistantSupervisor |
| managerUserId             | UUID     | No       | Foreign key to User - lookup                                            |
| managerEmail              | String   | No       | Auto-selected via business rule from User                               |
| supervisorUserId          | UUID     | No       | Foreign key to User - lookup                                            |
| supervisorEmail           | String   | No       | Auto-selected via business rule from User                               |
| assistantSupervisorUserId | UUID     | No       | Foreign key to User - lookup                                            |
| assistantSupervisorEmail  | String   | No       | Auto-selected via business rule from User                               |
| teamMemberUserId          | UUID     | No       | Foreign key to User - lookup                                            |
| teamMemberEmail           | String   | No       | Auto-selected via business rule from User                               |
| sharedMailboxEmail        | String   | No       | Admin entered shared mailbox for region                                 |
| createdAt                 | DateTime | Yes      | System timestamp                                                        |
| updatedAt                 | DateTime | Yes      | System timestamp                                                        |
| createdBy                 | String   | No       | User ID                                                                 |

**Relationships:**

- Has many Referrals
- Belongs to User (manager)
- Belongs to User (supervisor)
- Belongs to User (assistantSupervisor)
- Belongs to User (teamMember)

---

## Ministry Table

BC Government ministries that can refer individuals.

| Field     | Type     | Required | Notes                                                             |
| --------- | -------- | -------- | ----------------------------------------------------------------- |
| id        | UUID     | Yes      | Primary key                                                       |
| name      | String   | Yes      | Unique, e.g. "Ministry of Social Development & Poverty Reduction" |
| code      | String   | No       | Short code, e.g. "SDPR"                                           |
| isActive  | Boolean  | Yes      | Default: true                                                     |
| createdAt | DateTime | Yes      | Timestamp                                                         |
| updatedAt | DateTime | Yes      | Timestamp                                                         |
| createdBy | String   | No       | User ID                                                           |

**Relationships:**

- Has many Referrals

---

## AgencyType Table

Types of partner agencies that can refer individuals.

| Field     | Type     | Required | Notes                                         |
| --------- | -------- | -------- | --------------------------------------------- |
| id        | UUID     | Yes      | Primary key                                   |
| name      | String   | Yes      | Unique, e.g. "BC Housing", "Health Authority" |
| isActive  | Boolean  | Yes      | Default: true                                 |
| createdAt | DateTime | Yes      | Timestamp                                     |
| updatedAt | DateTime | Yes      | Timestamp                                     |
| createdBy | String   | No       | User ID                                       |

**Relationships:**

- Has many Referrals

---

## User Table

System users who manage referrals (internal staff). All fields are system-managed.

| Field       | Type     | Required | Notes                                                               |
| ----------- | -------- | -------- | ------------------------------------------------------------------- |
| id          | UUID     | Yes      | Primary key (System)                                                |
| fullName    | String   | Yes      | Full name (System)                                                  |
| email       | String   | Yes      | Unique email (System)                                               |
| address     | String   | No       | Physical address (System)                                           |
| contact     | String   | No       | Contact information (System)                                        |
| role        | UserRole | Yes      | MANAGER, ASSISTANT_MANAGER, SUPERVISOR, ADMIN, SYSTEM_ADMINISTRATOR |
| isActive    | Boolean  | Yes      | Default: true, can be disabled temporarily                          |
| deletedAt   | DateTime | No       | Soft delete timestamp (NULL = active, timestamp = deleted)          |
| keycloakId  | String   | No       | Unique, SSO integration                                             |
| createdAt   | DateTime | Yes      | Timestamp                                                           |
| updatedAt   | DateTime | Yes      | Timestamp                                                           |
| lastLoginAt | DateTime | No       | Timestamp                                                           |

**Relationships:**

- Can be assigned to multiple Regions (manager, supervisor, assistant supervisor, team member)
- Has many assigned Referrals
- Has many ReferralAuditLog entries

---

## Contact Table

Portal users who submit referrals (external partners). All fields are user-entered during registration.

| Field       | Type     | Required | Notes                                    |
| ----------- | -------- | -------- | ---------------------------------------- |
| id          | UUID     | Yes      | Primary key                              |
| userName    | String   | Yes      | Unique username for login (User Entered) |
| fullName    | String   | Yes      | Full name (User Entered)                 |
| companyName | String   | No       | Organization/company name (User Entered) |
| email       | String   | Yes      | Unique email for authentication          |
| isActive    | Boolean  | Yes      | Default: true                            |
| keycloakId  | String   | No       | Unique, SSO integration for portal       |
| createdAt   | DateTime | Yes      | Timestamp                                |
| updatedAt   | DateTime | Yes      | Timestamp                                |
| lastLoginAt | DateTime | No       | Timestamp of last portal login           |

**Relationships:**

- Has many created Referrals (external submissions from portal)

---

## Referral Table

Main table storing referral submissions.

### System Fields

| Field      | Type     | Required | Notes                           |
| ---------- | -------- | -------- | ------------------------------- |
| id         | UUID     | Yes      | Primary key (ReferralID/System) |
| createdAt  | DateTime | Yes      | System timestamp (Created On)   |
| updatedAt  | DateTime | Yes      | System timestamp (Modified On)  |
| modifiedBy | String   | No       | User Table lookup (System)      |
| createdBy  | String   | No       | Contact ID who created referral |

### Referrer Information (Form Questions)

| Field               | Type           | Required | Notes                                                                               |
| ------------------- | -------------- | -------- | ----------------------------------------------------------------------------------- |
| referredBy          | ReferredByType | Yes      | Choices: PARTNER_MINISTRY, SDPR_INTERNAL, PARTNER_AGENCY (Referral Form Question 1) |
| ministryId          | UUID           | No       | Choices/Foreign key to Ministry (if referredBy = PARTNER_MINISTRY)                  |
| ministryNameOther   | String         | No       | Text: If Name of Ministry = Other                                                   |
| programArea         | String         | No       | Text: If 'Referred By' = Partner Ministry                                           |
| partnerAgencyName   | String         | No       | Text: If 'Referred By' = Partner Agency                                             |
| agencyTypeId        | UUID           | No       | Choices/Foreign key to AgencyType (if referredBy = PARTNER_AGENCY)                  |
| agencyTypeOther     | String         | No       | Text: If Type of Agency = Other                                                     |
| personId            | String         | No       | Text: PID (ICM Person ID) - If 'Referred By' = SDPR Internal                        |
| referrerContactName | String         | Yes      | Text: User Entered                                                                  |
| referrerEmail       | String         | Yes      | Email: User Entered                                                                 |
| referrerPhone       | String         | Yes      | Number: User Entered                                                                |

### Individual Information (Form Questions)

| Field                   | Type | Required | Notes                       |
| ----------------------- | ---- | -------- | --------------------------- |
| individualFirstName     | Text | Yes      | User Entered                |
| individualMiddleName    | Text | No       | User Entered (optional)     |
| individualLastName      | Text | Yes      | User Entered                |
| individualPreferredName | Text | No       | User Entered                |
| gainFile                | Text | No       | GAIN file number (optional) |
| individualDateOfBirth   | Date | No       | Date Only: User Entered     |
| individualPhone         | Text | No       | Number: User Entered        |

### Location Information (Form Questions)

| Field            | Type   | Required | Notes                                                              |
| ---------------- | ------ | -------- | ------------------------------------------------------------------ |
| regionId         | UUID   | Yes      | LookUp: User selects from 12 regions with description              |
| specificCityTown | String | Yes      | Text: User Entered                                                 |
| bestWayToReach   | String | No       | Text: User Entered (What is the best way to reach the individual?) |
| secondaryContact | String | No       | Text: User Entered                                                 |

### Housing & Release Information (Form Questions with Flag Logic)

| Field             | Type            | Required | Notes                                                                                                                          |
| ----------------- | --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| currentlyHomeless | YesNoUnknown    | Yes      | Choices: If Yes, flag                                                                                                          |
| losingHousing     | YesNoUnknown    | No       | Choices: Conditional if 'Experiencing Homelessness' = No/Unknown. If Yes, flag and also ask for Summary in 'Referral Reason'   |
| pendingRelease    | ReleaseFromType | No       | Choices: Can be left blank, if not blank flag                                                                                  |
| releaseDate       | Date            | No       | Date Only: Conditional if 'Pending or Recently Releases' != Not Blank. For immediately pending release (within 3-4 days), flag |
| flag              | Boolean         | Yes      | Yes/No: Yes if any of the above 4 columns are satisfied (either Yes or not blank or shorter release/discharge date)            |

### Supports Information (Form Questions)

| Field                           | Type          | Required | Notes                                            |
| ------------------------------- | ------------- | -------- | ------------------------------------------------ |
| currentlyConnectedSupports      | SupportType[] | No       | Multichoice: Select all that apply               |
| currentlyConnectedSupportsOther | String        | No       | Text: If 'Supports Currently Connected' = Others |
| neededSupports                  | SupportType[] | No       | Multichoice: Select all that apply               |
| neededSupportsOther             | String        | No       | Text: If 'Needed Supports' = Others              |
| referralSummary                 | String        | No       | Multiline Text: User Entered (Referral Reason)   |

**SupportType Enum Values:**

- CULTURAL
- COMMUNITY_SUPPORTS
- FOOD_SECURITY
- HOUSING
- INCOME_ASSISTANCE_PROVINCIAL
- INCOME_ASSISTANCE_FEDERAL
- MENTAL_HEALTH
- SYSTEM_NAVIGATION
- HEALTH_SERVICES
- SUBSTANCE_USE
- INDIGENOUS_SUPPORTS
- INTEGRATED_JUSTICE_SUPPORTS
- OTHERS

### Workflow & Management Fields

| Field                | Type            | Required | Notes                                                       |
| -------------------- | --------------- | -------- | ----------------------------------------------------------- |
| referralOutcome      | ReferralOutcome | No       | Choices: Team Member Selects in the App                     |
| communityPartnerName | String          | No       | Text: If 'Referral Outcome' = Referred to Community Partner |
| referralStatus       | ReferralStatus  | Yes      | Choice: Business Rule                                       |
| assignedToId         | UUID            | No       | Foreign key to User                                         |
| followUpDate         | Date            | No       | Follow-up date (date only)                                  |
| dueDate              | Date            | No       | Due date (date only)                                        |
| completedDate        | Date            | No       | Completion date (date only)                                 |

**ReferralOutcome Enum Values:**

- BCEA_APPLICATION_SUBMITTED
- BCEA_APPLICATION_COMPLETED_FILE_OPENED
- SUPPLEMENTS_ISSUED
- CASE_MANAGED
- SERVICES_PROVIDED
- NOT_LOCATED
- LOCATED_REFUSED_SERVICE
- NON_APPROPRIATE_REFERRAL_RETURNED
- REFERRED_TO_VS_CS
- REFERRED_TO_COMMUNITY_PARTNER

**ReferralStatus Enum Values:**

- OPEN
- ASSIGNED
- CONTACT_MADE
- CLOSED

**Relationships:**

- Belongs to Region
- Belongs to Ministry (optional)
- Belongs to AgencyType (optional)
- Belongs to User (assignedTo, optional)
- Belongs to Contact (createdBy, optional)
- Has many ReferralAuditLog entries

---

## ReferralAuditLog Table

Audit trail tracking all field-level changes to referrals.

| Field        | Type        | Required | Notes                                      |
| ------------ | ----------- | -------- | ------------------------------------------ |
| id           | UUID        | Yes      | Primary key                                |
| referralId   | UUID        | Yes      | Foreign key to Referral                    |
| action       | AuditAction | Yes      | CREATE or UPDATE                           |
| fieldChanged | String      | Yes      | Name of the field that was changed         |
| oldValue     | Text        | No       | Previous value (null for initial creation) |
| newValue     | Text        | No       | New value                                  |
| comment      | Text        | No       | Optional comment about the change          |
| changedBy    | UUID        | Yes      | Foreign key to User who made the change    |
| changedAt    | DateTime    | Yes      | Timestamp of change (defaults to now)      |

**Relationships:**

- Belongs to Referral (cascade delete)
- Belongs to User (changedBy)

---

## Enums Reference

### ReferredByType

- PARTNER_MINISTRY
- SDPR_INTERNAL
- PARTNER_AGENCY

### YesNoUnknown

- YES
- NO
- UNKNOWN

### ReleaseFromType

- NO
- HOSPITAL_MEDICAL_FACILITY
- CORRECTIONS
- YOUTH_TRANSITION_MCFD
- YOUTH_TRANSITION_DELEGATED_ABORIGINAL_AGENCY
- ALCOHOL_DRUG_FACILITY

### UserRole

- MANAGER
- ASSISTANT_MANAGER
- SUPERVISOR
- ADMIN
- SYSTEM_ADMINISTRATOR

### AuditAction

- CREATE
- UPDATE

### ReferralStatus

- OPEN
- ASSIGNED
- CONTACT_MADE
- CLOSED

### ReferralOutcome

- BCEA_APPLICATION_SUBMITTED
- BCEA_APPLICATION_COMPLETED_FILE_OPENED
- SUPPLEMENTS_ISSUED
- CASE_MANAGED
- SERVICES_PROVIDED
- NOT_LOCATED
- LOCATED_REFUSED_SERVICE
- NON_APPROPRIATE_REFERRAL_RETURNED
- REFERRED_TO_VS_CS
- REFERRED_TO_COMMUNITY_PARTNER

---

## Indexes

Performance indexes on frequently queried fields:

**Region:**

- isActive

**Ministry:**

- isActive

**AgencyType:**

- isActive

**User:**

- email
- role
- regionId
- isActive

**Referral:**

- referredBy
- regionId
- ministryId
- agencyTypeId
- currentlyHomeless
- referralStatus
- assignedToId
- createdAt
- flag

**ReferralAuditLog:**

- referralId
- changedAt
- action

---

## Future Phases (Not in Current Schema)

### ReferralAttachment Table

File uploads/attachments will be added in a future phase.
