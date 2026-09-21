import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FindingStatus, SeverityLevel } from '@prisma/client';

export class CreateFindingDto {
  @ApiProperty({ example: 'a1234567-89ab-cdef-0123-456789abcdef' })
  @IsString()
  @IsNotEmpty()
  auditId: string;

  @ApiProperty({ example: 'c1234567-89ab-cdef-0123-456789abcdef', required: false })
  @IsString()
  @IsOptional()
  controlId?: string;

  @ApiProperty({ example: 'Missing evidence of Q3 access reviews' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Quarterly user access review for AWS production accounts was not documented' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: SeverityLevel, default: SeverityLevel.HIGH })
  @IsEnum(SeverityLevel)
  severity: SeverityLevel;

  @ApiProperty({ enum: FindingStatus, default: FindingStatus.OPEN, required: false })
  @IsEnum(FindingStatus)
  @IsOptional()
  status?: FindingStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiProperty({ example: '2025-07-15T00:00:00.000Z', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateFindingDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: SeverityLevel, required: false })
  @IsEnum(SeverityLevel)
  @IsOptional()
  severity?: SeverityLevel;

  @ApiProperty({ enum: FindingStatus, required: false })
  @IsEnum(FindingStatus)
  @IsOptional()
  status?: FindingStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  assignedToId?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  resolutionNotes?: string;
}
