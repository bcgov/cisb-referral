import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SYSTEM_ADMINISTRATOR = 'SYSTEM_ADMINISTRATOR',
}

export class UserDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ default: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  updatedAt: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  lastLoginAt?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keycloakId?: string;
}
