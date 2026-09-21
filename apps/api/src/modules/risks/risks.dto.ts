import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { RiskStatus, SeverityLevel, RiskTreatment } from '@prisma/client';

export function calculateRiskSeverity(likelihood: number, impact: number): { riskScore: number; severity: SeverityLevel } {
  const riskScore = likelihood * impact;
  let severity: SeverityLevel = SeverityLevel.LOW;
  if (riskScore >= 15) {
    severity = SeverityLevel.CRITICAL;
  } else if (riskScore >= 10) {
    severity = SeverityLevel.HIGH;
  } else if (riskScore >= 5) {
    severity = SeverityLevel.MEDIUM;
  }
  return { riskScore, severity };
}

export class CreateRiskDto {
  @ApiProperty({ example: 'Unauthorized production database access' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Production database credentials leaked or insufficiently restricted' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Access Security' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  inherentLikelihood: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  inherentImpact: number;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  residualLikelihood?: number;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  residualImpact?: number;

  @ApiProperty({ enum: RiskStatus, default: RiskStatus.OPEN, required: false })
  @IsEnum(RiskStatus)
  @IsOptional()
  status?: RiskStatus;

  @ApiProperty({ enum: RiskTreatment, required: false })
  @IsEnum(RiskTreatment)
  @IsOptional()
  treatment?: RiskTreatment;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  controlId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ownerId?: string;
}

export class UpdateRiskDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  inherentLikelihood?: number;

  @ApiProperty({ minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  inherentImpact?: number;

  @ApiProperty({ minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  residualLikelihood?: number;

  @ApiProperty({ minimum: 1, maximum: 5, required: false })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  residualImpact?: number;

  @ApiProperty({ enum: RiskStatus, required: false })
  @IsEnum(RiskStatus)
  @IsOptional()
  status?: RiskStatus;

  @ApiProperty({ enum: RiskTreatment, required: false })
  @IsEnum(RiskTreatment)
  @IsOptional()
  treatment?: RiskTreatment;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ownerId?: string;
}
