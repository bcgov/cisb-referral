import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateReferralDto,
  ReferredByType,
  YesNoUnknown,
} from './create-referral.dto';

const validBase = {
  referredBy: ReferredByType.SDPR_INTERNAL,
  referrerContactName: 'Test Contact',
  referrerEmail: 'test@test.com',
  referrerPhone: '0000000000',
  individualFirstName: 'Test',
  regionId: '00000000-0000-4000-8000-000000000001',
  specificCityTown: 'Test City',
  experiencingHomelessness: YesNoUnknown.NO,
  losingHouse: YesNoUnknown.NO,
  referralReason: 'Test referral reason',
};

const toDto = (overrides: Record<string, unknown> = {}): CreateReferralDto =>
  plainToInstance(CreateReferralDto, { ...validBase, ...overrides });

describe('CreateReferralDto', () => {
  it('should accept a valid referral with all required fields', async () => {
    const dto = toDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('losingHouse conditional validation', () => {
    it('should require losingHouse when experiencingHomelessness is NO', async () => {
      const dto = toDto({
        experiencingHomelessness: YesNoUnknown.NO,
        losingHouse: undefined,
      });
      const errors = await validate(dto);
      const losingErr = errors.find((e) => e.property === 'losingHouse');
      expect(losingErr).toBeDefined();
    });

    it('should require losingHouse when experiencingHomelessness is UNKNOWN', async () => {
      const dto = toDto({
        experiencingHomelessness: YesNoUnknown.UNKNOWN,
        losingHouse: undefined,
      });
      const errors = await validate(dto);
      const losingErr = errors.find((e) => e.property === 'losingHouse');
      expect(losingErr).toBeDefined();
    });

    it('should not require losingHouse when experiencingHomelessness is YES', async () => {
      const dto = toDto({
        experiencingHomelessness: YesNoUnknown.YES,
        losingHouse: undefined,
      });
      const errors = await validate(dto);
      const losingErr = errors.find((e) => e.property === 'losingHouse');
      expect(losingErr).toBeUndefined();
    });

    it('should accept losingHouse with a valid enum value', async () => {
      const dto = toDto({
        experiencingHomelessness: YesNoUnknown.NO,
        losingHouse: YesNoUnknown.YES,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('partnerAgencyName conditional validation', () => {
    it('should require partnerAgencyName when referredBy is PARTNER_AGENCY', async () => {
      const dto = toDto({
        referredBy: ReferredByType.PARTNER_AGENCY,
        partnerAgencyName: undefined,
        agencyTypeId: '00000000-0000-4000-8000-000000000003',
      });
      const errors = await validate(dto);
      const nameErr = errors.find((e) => e.property === 'partnerAgencyName');
      expect(nameErr).toBeDefined();
    });

    it('should not require partnerAgencyName when referredBy is SDPR_INTERNAL', async () => {
      const dto = toDto({
        referredBy: ReferredByType.SDPR_INTERNAL,
        partnerAgencyName: undefined,
      });
      const errors = await validate(dto);
      const nameErr = errors.find((e) => e.property === 'partnerAgencyName');
      expect(nameErr).toBeUndefined();
    });
  });

  describe('agencyTypeId conditional validation', () => {
    it('should require agencyTypeId when referredBy is PARTNER_AGENCY', async () => {
      const dto = toDto({
        referredBy: ReferredByType.PARTNER_AGENCY,
        partnerAgencyName: 'Test Agency',
        agencyTypeId: undefined,
      });
      const errors = await validate(dto);
      const agencyErr = errors.find((e) => e.property === 'agencyTypeId');
      expect(agencyErr).toBeDefined();
    });

    it('should not require agencyTypeId when referredBy is PARTNER_MINISTRY', async () => {
      const dto = toDto({
        referredBy: ReferredByType.PARTNER_MINISTRY,
        ministryId: '00000000-0000-4000-8000-000000000002',
        agencyTypeId: undefined,
      });
      const errors = await validate(dto);
      const agencyErr = errors.find((e) => e.property === 'agencyTypeId');
      expect(agencyErr).toBeUndefined();
    });
  });

  describe('ministryId conditional validation', () => {
    it('should require ministryId when referredBy is PARTNER_MINISTRY', async () => {
      const dto = toDto({
        referredBy: ReferredByType.PARTNER_MINISTRY,
        ministryId: undefined,
      });
      const errors = await validate(dto);
      const ministryErr = errors.find((e) => e.property === 'ministryId');
      expect(ministryErr).toBeDefined();
    });

    it('should not require ministryId when referredBy is SDPR_INTERNAL', async () => {
      const dto = toDto({
        referredBy: ReferredByType.SDPR_INTERNAL,
        ministryId: undefined,
      });
      const errors = await validate(dto);
      const ministryErr = errors.find((e) => e.property === 'ministryId');
      expect(ministryErr).toBeUndefined();
    });
  });

  describe('enum validation', () => {
    it('should reject invalid referredBy value', async () => {
      const dto = toDto({ referredBy: 'INVALID' });
      const errors = await validate(dto);
      const err = errors.find((e) => e.property === 'referredBy');
      expect(err).toBeDefined();
    });

    it('should reject invalid experiencingHomelessness value', async () => {
      const dto = toDto({ experiencingHomelessness: 'MAYBE' });
      const errors = await validate(dto);
      const err = errors.find((e) => e.property === 'experiencingHomelessness');
      expect(err).toBeDefined();
    });

    it('should reject invalid pendingOrRecentlyReleased value', async () => {
      const dto = toDto({ pendingOrRecentlyReleased: 'INVALID_RELEASE' });
      const errors = await validate(dto);
      const err = errors.find(
        (e) => e.property === 'pendingOrRecentlyReleased',
      );
      expect(err).toBeDefined();
    });

    it('should reject invalid support type in array', async () => {
      const dto = toDto({
        currentlyConnectedSupports: ['HOUSING', 'INVALID_TYPE'],
      });
      const errors = await validate(dto);
      const err = errors.find(
        (e) => e.property === 'currentlyConnectedSupports',
      );
      expect(err).toBeDefined();
    });
  });
});
