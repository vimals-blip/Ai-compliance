import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AIReviewStatus } from '@prisma/client';

export class TriggerEvidenceAnalysisDto {
  @ApiProperty({ example: ['c1234567-89ab-cdef-0123-456789abcdef'] })
  @IsArray()
  @IsNotEmpty()
  controlIds: string[];
}

export class ReviewAIAnalysisDto {
  @ApiProperty({ enum: AIReviewStatus, example: AIReviewStatus.ACCEPTED })
  @IsEnum(AIReviewStatus)
  reviewStatus: AIReviewStatus;

  @ApiProperty({ example: 'Reviewed and confirmed findings with engineering lead', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
