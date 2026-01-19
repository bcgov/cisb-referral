import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';

/**
 * DTO for updating contact profile
 * Used by contacts to complete/update their profile
 * Note: fullName and email come from Keycloak and cannot be changed here
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '250-555-1234',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9\s()+.-]+$/, {
    message:
      'Phone number can only contain digits, spaces, and -+() characters',
  })
  phone?: string;
}
