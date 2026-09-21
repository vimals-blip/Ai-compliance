import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EvidenceStatus } from '@prisma/client';

export class CreateEvidenceDto {
  @ApiProperty({ example: 'Production Database Access Policy 2025' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Formal policy documenting RBAC and quarterly access review procedures' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'POLICY' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'evidence/org-1/2025/access-policy.pdf' })
  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 245760 })
  @IsInt()
  fileSize: number;

  @ApiProperty({ enum: EvidenceStatus, default: EvidenceStatus.PENDING_REVIEW, required: false })
  @IsEnum(EvidenceStatus)
  @IsOptional()
  status?: EvidenceStatus;

  @ApiProperty({ example: ['c1234567-89ab-cdef-0123-456789abcdef'], required: false })
  @IsArray()
  @IsOptional()
  controlIds?: string[];
}
