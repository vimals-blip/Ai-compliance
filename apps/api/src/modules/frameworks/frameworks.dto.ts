import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFrameworkDto {
  @ApiProperty({ example: 'SOC 2 Type II' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SOC2' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '2017 Trust Services Criteria' })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ example: 'AICPA Trust Services Criteria for Security, Availability, and Confidentiality' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'AICPA' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: '2017' })
  @IsString()
  @IsOptional()
  sourceVersion?: string;

  @ApiProperty({ example: 'Public reference specification' })
  @IsString()
  @IsOptional()
  licenseOrUsageNote?: string;
}
