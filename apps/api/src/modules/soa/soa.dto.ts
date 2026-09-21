import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStatementOfApplicabilityDto {
  @ApiProperty({ example: 'ISO 27001 SOA 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  snapshotDate?: string;
}

export class UpdateStatementOfApplicabilityDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  snapshotDate?: string;
}

export class CreateApplicabilityStatementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  controlId: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isApplicable: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  justification?: string;
}

export class UpdateApplicabilityStatementDto {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isApplicable?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  justification?: string;
}
