import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  UpdateReferralDto,
  ReferralStatus,
  ReferralOutcome,
} from './update-referral.dto';
import {
  ReferredByType,
  YesNoUnknown,
  ReleaseFromType,
} from './create-referral.dto';
import { SupportType } from '../../generated/prisma/client';

const toDto = (plain: Record<string, unknown>): UpdateReferralDto =>
  plainToInstance(UpdateReferralDto, plain);

describe('UpdateReferralDto', () => {
  it('should accept a valid empty update', async () => {
    const dto = toDto({});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('referralStatus', () => {
    it('should accept a valid enum value', async () => {
      const dto = toDto({ referralStatus: ReferralStatus.ASSIGNED });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid string', async () => {
      const dto = toDto({ referralStatus: 'INVALID_STATUS' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('referralStatus');
    });
  });

  describe('referralOutcome', () => {
    it('should accept a valid enum value', async () => {
      const dto = toDto({ referralOutcome: ReferralOutcome.SERVICES_PROVIDED });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid string', async () => {
      const dto = toDto({ referralOutcome: 'MADE_UP_OUTCOME' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('referralOutcome');
    });
  });

  describe('referredBy', () => {
    it('should accept a valid enum value', async () => {
      const dto = toDto({ referredBy: ReferredByType.PARTNER_AGENCY });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid string', async () => {
      const dto = toDto({ referredBy: 'RANDOM_SOURCE' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('referredBy');
    });
  });

  describe('experiencingHomelessness', () => {
    it('should accept a valid enum value', async () => {
      const dto = toDto({ experiencingHomelessness: YesNoUnknown.YES });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid string', async () => {
      const dto = toDto({ experiencingHomelessness: 'MAYBE' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('experiencingHomelessness');
    });
  });

  describe('losingHouse', () => {
    it('should accept a valid enum value', async () => {
      const dto = toDto({ losingHouse: YesNoUnknown.NO });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid string', async () => {
      const dto = toDto({ losingHouse: 'MAYBE' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('losingHouse');
    });
  });

  describe('pendingOrRecentlyReleased', () => {
    it('should accept a valid enum value', async () => {
      const dto = toDto({
        pendingOrRecentlyReleased: ReleaseFromType.CORRECTIONS,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid string', async () => {
      const dto = toDto({ pendingOrRecentlyReleased: 'SOME_FACILITY' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('pendingOrRecentlyReleased');
    });
  });

  describe('currentlyConnectedSupports', () => {
    it('should accept valid enum array', async () => {
      const dto = toDto({
        currentlyConnectedSupports: [SupportType.HOUSING, SupportType.CULTURAL],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject array with invalid values', async () => {
      const dto = toDto({
        currentlyConnectedSupports: ['HOUSING', 'INVALID_SUPPORT'],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('currentlyConnectedSupports');
    });
  });

  describe('neededSupports', () => {
    it('should accept valid enum array', async () => {
      const dto = toDto({
        neededSupports: [SupportType.MENTAL_HEALTH],
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject array with invalid values', async () => {
      const dto = toDto({
        neededSupports: ['FAKE_SUPPORT'],
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('neededSupports');
    });
  });
});
