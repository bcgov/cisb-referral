import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindAllReferralsDto } from './find-all-referrals.dto';

describe('FindAllReferralsDto', () => {
  it('should trim search and filter values before validation', async () => {
    const dto = plainToInstance(FindAllReferralsDto, {
      search: '  Jane  ',
      filterValue: '  Smith  ',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.search).toBe('Jane');
    expect(dto.filterValue).toBe('Smith');
  });

  it('should reject whitespace-only search and filter values', async () => {
    const dto = plainToInstance(FindAllReferralsDto, {
      search: '   ',
      filterValue: '   ',
    });

    const errors = await validate(dto);

    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['search', 'filterValue']),
    );
  });
});
