import { describe, expect, it } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { ReleaseFromType, SupportType } from './dto/create-referral.dto';
import { ReferralOutcome, ReferralStatus } from './dto/update-referral.dto';
import {
  ReferralFilterOperator,
  ReferralSortOrder,
} from './dto/find-all-referrals.dto';
import {
  buildOrderBy,
  buildWhere,
  parseBooleanToken,
  parseDateRange,
  parseNumberToken,
} from './referrals-query.builder';

describe('referrals query builder', () => {
  describe('value parsers', () => {
    it('should parse supported boolean tokens', () => {
      expect(parseBooleanToken('yes')).toBe(true);
      expect(parseBooleanToken('TRUE')).toBe(true);
      expect(parseBooleanToken('0')).toBe(false);
      expect(parseBooleanToken('n')).toBe(false);
      expect(parseBooleanToken('maybe')).toBeUndefined();
    });

    it('should parse dates as a UTC day range', () => {
      expect(parseDateRange('2026-01-15')).toEqual({
        gte: new Date(Date.UTC(2026, 0, 15)),
        lt: new Date(Date.UTC(2026, 0, 16)),
      });
      expect(parseDateRange('not-a-date')).toBeUndefined();
    });

    it('should parse only finite numbers', () => {
      expect(parseNumberToken('3.5')).toBe(3.5);
      expect(parseNumberToken('Infinity')).toBeUndefined();
      expect(parseNumberToken('not-a-number')).toBeUndefined();
    });
  });

  describe('buildWhere', () => {
    it('should return base filters without search clauses', () => {
      expect(
        buildWhere({
          status: ReferralStatus.OPEN,
          regionId: 'region-1',
          assignedToId: 'user-1',
        }),
      ).toEqual({
        referralStatus: ReferralStatus.OPEN,
        regionId: 'region-1',
        assignedToId: 'user-1',
      });
    });

    it('should ignore blank search and filter values', () => {
      expect(
        buildWhere({
          search: '   ',
          filterBy: 'individualLastName',
          filterValue: '   ',
        }),
      ).toEqual({});
    });

    it('should build global search clauses for text, relations, labels, and typed values', () => {
      const where = buildWhere({ search: 'Contact-Made' });

      expect(where).toEqual({
        AND: [
          {
            OR: expect.arrayContaining([
              {
                individualFirstName: {
                  contains: 'Contact-Made',
                  mode: 'insensitive',
                },
              },
              {
                region: {
                  name: {
                    contains: 'Contact-Made',
                    mode: 'insensitive',
                  },
                },
              },
              { referralStatus: ReferralStatus.CONTACT_MADE },
            ]),
          },
        ],
      });
    });

    it('should add support, boolean, numeric, and date matches to global search', () => {
      const supportWhere = buildWhere({ search: 'Income Assistance Federal' });
      expect(supportWhere).toEqual({
        AND: [
          {
            OR: expect.arrayContaining([
              {
                neededSupports: {
                  hasSome: [SupportType.INCOME_ASSISTANCE_FEDERAL],
                },
              },
            ]),
          },
        ],
      });

      expect(buildWhere({ search: 'yes' })).toEqual({
        AND: [
          {
            OR: expect.arrayContaining([{ flag: true }]),
          },
        ],
      });
      expect(buildWhere({ search: '7' })).toEqual({
        AND: [
          {
            OR: expect.arrayContaining([{ lottTriage: 7 }, { lottContact: 7 }]),
          },
        ],
      });
      expect(buildWhere({ search: '2026-01-15' })).toEqual({
        AND: [
          {
            OR: expect.arrayContaining([
              {
                createdAt: {
                  gte: new Date(Date.UTC(2026, 0, 15)),
                  lt: new Date(Date.UTC(2026, 0, 16)),
                },
              },
            ]),
          },
        ],
      });
    });

    it('should build string and relation column filters', () => {
      expect(
        buildWhere({
          filterBy: 'individualLastName',
          filterOperator: ReferralFilterOperator.EQUALS,
          filterValue: 'Smith',
        }),
      ).toEqual({
        AND: [
          {
            individualLastName: {
              equals: 'Smith',
              mode: 'insensitive',
            },
          },
        ],
      });

      expect(
        buildWhere({
          filterBy: 'region',
          filterValue: 'Island',
        }),
      ).toEqual({
        AND: [
          {
            region: {
              name: {
                contains: 'Island',
                mode: 'insensitive',
              },
            },
          },
        ],
      });
    });

    it('should build enum, support, date, numeric, and boolean column filters', () => {
      expect(
        buildWhere({
          filterBy: 'referralOutcome',
          filterOperator: ReferralFilterOperator.EQUALS,
          filterValue: 'Nonfinancial Supports Provided',
        }),
      ).toEqual({
        AND: [{ referralOutcome: ReferralOutcome.SERVICES_PROVIDED }],
      });

      expect(
        buildWhere({
          filterBy: 'pendingOrRecentlyReleased',
          filterOperator: ReferralFilterOperator.EQUALS,
          filterValue: 'Hospital/Medical Facility',
        }),
      ).toEqual({
        AND: [
          {
            pendingOrRecentlyReleased:
              ReleaseFromType.HOSPITAL_MEDICAL_FACILITY,
          },
        ],
      });

      expect(
        buildWhere({
          filterBy: 'neededSupports',
          filterOperator: ReferralFilterOperator.EQUALS,
          filterValue: 'Income Assistance (Provincial)',
        }),
      ).toEqual({
        AND: [
          {
            neededSupports: {
              has: SupportType.INCOME_ASSISTANCE_PROVINCIAL,
            },
          },
        ],
      });

      expect(
        buildWhere({
          filterBy: 'neededSupports',
          filterValue: 'Income Assistance',
        }),
      ).toEqual({
        AND: [
          {
            neededSupports: {
              hasSome: [
                SupportType.INCOME_ASSISTANCE_PROVINCIAL,
                SupportType.INCOME_ASSISTANCE_FEDERAL,
              ],
            },
          },
        ],
      });

      expect(
        buildWhere({
          filterBy: 'createdAt',
          filterValue: '2026-01-15',
        }),
      ).toEqual({
        AND: [
          {
            createdAt: {
              gte: new Date(Date.UTC(2026, 0, 15)),
              lt: new Date(Date.UTC(2026, 0, 16)),
            },
          },
        ],
      });

      expect(
        buildWhere({
          filterBy: 'lottTriage',
          filterValue: '12.5',
        }),
      ).toEqual({ AND: [{ lottTriage: 12.5 }] });

      expect(buildWhere({ filterBy: 'flag', filterValue: 'true' })).toEqual({
        AND: [{ flag: true }],
      });
    });

    it('should reject invalid typed and label-backed filters', () => {
      expect(() =>
        buildWhere({
          filterBy: 'referralStatus',
          filterOperator: ReferralFilterOperator.EQUALS,
          filterValue: 'Not a status',
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        buildWhere({
          filterBy: 'createdAt',
          filterValue: 'not-a-date',
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        buildWhere({
          filterBy: 'lottContact',
          filterValue: 'not-a-number',
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        buildWhere({
          filterBy: 'flag',
          filterValue: 'maybe',
        }),
      ).toThrow(BadRequestException);
    });

    it('should reject contains operator for typed columns', () => {
      expect(() =>
        buildWhere({
          filterBy: 'createdAt',
          filterOperator: ReferralFilterOperator.CONTAINS,
          filterValue: '2026-01-15',
        }),
      ).toThrow(BadRequestException);
    });
  });

  describe('buildOrderBy', () => {
    it('should build default, scalar, and relation sort clauses', () => {
      expect(buildOrderBy()).toEqual({ createdAt: 'desc' });
      expect(buildOrderBy('individualLastName', ReferralSortOrder.ASC)).toEqual(
        {
          individualLastName: 'asc',
        },
      );
      expect(buildOrderBy('assignedTo', ReferralSortOrder.DESC)).toEqual({
        assignedTo: { fullName: 'desc' },
      });
    });

    it('should reject unsupported array sort columns', () => {
      expect(() =>
        buildOrderBy('currentlyConnectedSupports', ReferralSortOrder.ASC),
      ).toThrow(BadRequestException);
    });
  });
});
