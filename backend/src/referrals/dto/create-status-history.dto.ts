import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateStatusHistoryDto {
  @ApiProperty()
  @IsString()
  toStatus: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
