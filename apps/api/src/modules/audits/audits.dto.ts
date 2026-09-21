import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AuditStatus } from '@prisma/client';

export class CreateAuditDto {
  @ApiProperty({ example: 'f1234567-89ab-cdef-0123-456789abcdef' })
  @IsString()
  @IsNotEmpty()
  frameworkId: string;

  @ApiProperty({ example: 'SOC 2 Type II Annual Audit 2025' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Independent examination of Trust Services Criteria security controls' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AuditStatus, default: AuditStatus.PLANNED })
  @IsEnum(AuditStatus)
  @IsOptional()
  status?: AuditStatus;

  @ApiProperty({ example: '2025-06-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-06-30T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  leadAuditorId?: string;
}
