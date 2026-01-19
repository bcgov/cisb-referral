import { User, Contact } from '@prisma/client';

/**
 * Authenticated admin user attached to request
 * Represents internal BC Gov staff from admin-realm (IDIR)
 * Simply the Prisma User entity - DB is source of truth for roles
 */
export type AuthenticatedUser = User;

/**
 * Authenticated contact attached to request
 * Represents external partners from referral-realm (Entra IdP)
 * Wrapper needed for profile completion check
 */
export interface AuthenticatedContact {
  /** Database Contact record */
  contact: Contact;

  /** Whether the contact has completed profile setup (has required fields) */
  isProfileComplete: boolean;
}
