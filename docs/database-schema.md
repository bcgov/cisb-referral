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

## Entity Relationships

```
Region ──────────┐
Ministry ────────┤
AgencyType ──────┼──< Referral >──── ReferralStatusHistory
User ────────────┤
Contact ─────────┘
```

- A **Region** stores staff email contacts (manager, supervisor, assistant supervisor) but does not link directly to **User** records.
- A **Referral** belongs to a **Region** and optionally to a **Ministry** or **AgencyType** depending on the referral source.
- A **Referral** can be assigned to a **User** for case management.
- A **Referral** may be created by a **Contact** (external portal submission).
- **ReferralStatusHistory** tracks all status transitions on a referral.
