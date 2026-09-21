import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ControlStatus, ControlMaturityLevel } from '@prisma/client';

export class CreateControlDto {
  @ApiProperty({ example: 'b1234567-89ab-cdef-0123-456789abcdef' })
  @IsString()
  @IsNotEmpty()
  frameworkId: string;

  @ApiProperty({ example: 'CC6.1' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Logical Access Controls' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Access Control' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ enum: ControlStatus, default: ControlStatus.NOT_TESTED })
  @IsEnum(ControlStatus)
  @IsOptional()
  status?: ControlStatus;

  @ApiProperty({ enum: ControlMaturityLevel, default: ControlMaturityLevel.INITIAL })
  @IsEnum(ControlMaturityLevel)
  @IsOptional()
  maturityLevel?: ControlMaturityLevel;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isApplicable?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  regulatory?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  contractual?: boolean;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  bestPractice?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notImplementedJustification?: string;

  @ApiProperty({ example: 'ACCESS_CONTROL', required: false })
  @IsString()
  @IsOptional()
  commonControlCode?: string;
}

export class UpdateControlDto {
  @ApiProperty({ enum: ControlStatus, required: false })
  @IsEnum(ControlStatus)
  @IsOptional()
  status?: ControlStatus;

  @ApiProperty({ enum: ControlMaturityLevel, required: false })
  @IsEnum(ControlMaturityLevel)
  @IsOptional()
  maturityLevel?: ControlMaturityLevel;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isApplicable?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  regulatory?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  contractual?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  bestPractice?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notImplementedJustification?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
